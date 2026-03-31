import hashlib
import requests

def check_pwned_passwords(password: str) -> dict:
    sha1_password = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
    prefix = sha1_password[:5]
    suffix = sha1_password[5:]

    url = f"https://api.pwnedpasswords.com/range/{prefix}"
    
    try:
        response = requests.get(url, timeout=5)
        if response.status_code != 200:
            return {"breached": False, "note": "API Error, could not check breach status."}

        hashes = (line.split(':') for line in response.text.splitlines())
        for h, count in hashes:
            if h == suffix:
                return {
                    "breached": True, 
                    "breach_count": int(count)
                }
                
        return {"breached": False, "breach_count": 0}
        
    except Exception as e:
         return {"breached": False, "error": str(e)}