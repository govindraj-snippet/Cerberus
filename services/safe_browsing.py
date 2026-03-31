import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY")

def check_safe_browsing(url: str) -> dict:
    if not API_KEY or API_KEY == "your_api_key_here":
        return {"is_safe": True, "note": "API bypassed (No Key)"}

    # THE FIX: Pointing to the modern Web Risk API
    api_url = "https://webrisk.googleapis.com/v1/uris:search"
    
    params = {
        "key": API_KEY,
        "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
        "uri": url
    }
    
    try:
        response = requests.get(api_url, params=params, timeout=5)
        data = response.json()
        
        if "error" in data:
            return {"is_safe": "ERROR", "google_error_message": data["error"]["message"]}
            
        if "threat" in data:
            return {
                "is_safe": False, 
                "threat_type": data["threat"]["threatTypes"][0],
                "details": "Google Web Risk flagged this URL."
            }
            
        return {"is_safe": True}
        
    except Exception as e:
        return {"is_safe": "ERROR", "python_error": str(e)}