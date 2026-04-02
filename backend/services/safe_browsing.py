import os
import requests
import base64
from dotenv import load_dotenv

load_dotenv()
VT_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")

def check_safe_browsing(url: str) -> dict:
    if not VT_API_KEY:
        return {"is_safe": True, "note": "VirusTotal bypassed (No API Key)"}

    url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
    api_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
    
    headers = {
        "accept": "application/json",
        "x-apikey": VT_API_KEY
    }
    
    try:
        response = requests.get(api_url, headers=headers, timeout=5)
        data = response.json()
        
        if response.status_code == 404:
            return {"is_safe": True, "note": "URL not found in VirusTotal database."}
            
        if "error" in data:
            return {"is_safe": "ERROR", "api_error_message": data["error"]["message"]}
            
        stats = data["data"]["attributes"]["last_analysis_stats"]
        malicious_count = stats.get("malicious", 0)
        suspicious_count = stats.get("suspicious", 0)
        
        if malicious_count > 0 or suspicious_count > 0:
            return {
                "is_safe": False, 
                "threat_type": "MALWARE/PHISHING",
                "details": f"Flagged as dangerous by {malicious_count + suspicious_count} vendors."
            }
            
        return {"is_safe": True}
        
    except Exception as e:
        return {"is_safe": True, "note": f"Fallback to AI Engine. Error: {str(e)}"}