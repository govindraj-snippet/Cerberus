# services/hibp_checker.py
import hashlib
import requests

def check_breach(password: str) -> dict:
    # k-Anonymity implementation
    sha1_password = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
    prefix = sha1_password[:5]
    suffix = sha1_password[5:]
    
    url = f"https://api.pwnedpasswords.com/range/{prefix}"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code != 200:
            return {"exposed": False, "breach_count": 0, "error": "API Error"}
            
        hashes = (line.split(':') for line in response.text.splitlines())
        for h, count in hashes:
            if h == suffix:
                return {"exposed": True, "breach_count": int(count)}
                
        return {"exposed": False, "breach_count": 0}
    except Exception as e:
        return {"exposed": False, "breach_count": 0, "error": str(e)}