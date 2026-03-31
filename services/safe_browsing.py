# services/safe_browsing.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY")

def check_safe_browsing(url: str) -> dict:
    if not API_KEY or API_KEY == "your_api_key_here":
        return {"is_safe": True, "note": "Safe Browsing bypassed (No API Key)"}

    api_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={API_KEY}"
    payload = {
        "client": {"clientId": "project-cerberus", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}]
        }
    }
    
    try:
        response = requests.post(api_url, json=payload, timeout=5)
        data = response.json()
        
        # --- THE DEBUGGING MAGIC ---
        # If Google throws an error, we force it to show up in our JSON response
        if "error" in data:
            return {"is_safe": "ERROR", "google_error_message": data["error"]["message"]}
        # ---------------------------
        
        if "matches" in data:
            return {"is_safe": False, "threats": data["matches"]}
            
        return {"is_safe": True}
    except Exception as e:
        return {"is_safe": "ERROR", "python_error": str(e)}