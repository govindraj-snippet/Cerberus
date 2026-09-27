import os
import requests
import base64
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()
VT_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")

@lru_cache(maxsize=1024)
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
            return {"is_safe": True, "note": "URL not found in VirusTotal database.", "stats": {"malicious": 0, "harmless": 0}}
            
        if "error" in data:
            return {"is_safe": "ERROR", "api_error_message": data["error"]["message"]}
            
        stats = data["data"]["attributes"]["last_analysis_stats"]
        malicious_count = stats.get("malicious", 0)
        suspicious_count = stats.get("suspicious", 0)
        harmless_count = stats.get("harmless", 0)
        undetected_count = stats.get("undetected", 0)
        
        is_safe = True
        threat_message = "URL not found in malicious databases."
        
        if malicious_count > 0 or suspicious_count > 0:
            is_safe = False
            threat_message = f"Flagged as dangerous by {malicious_count + suspicious_count} security vendors."
            
        return {
            "is_safe": is_safe,
            "threat_type": "MALWARE/PHISHING" if not is_safe else None,
            "note": threat_message,
            "stats": {
                "malicious": malicious_count,
                "suspicious": suspicious_count,
                "harmless": harmless_count,
                "undetected": undetected_count
            }
        }
        
    except Exception as e:
        return {"is_safe": True, "note": f"Fallback to AI Engine. Error: {str(e)}", "stats": None}