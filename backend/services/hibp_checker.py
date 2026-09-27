import requests
from functools import lru_cache

@lru_cache(maxsize=1024)
def check_pwned_passwords_prefix(prefix: str) -> dict:
    """
    Takes a 5-character SHA-1 prefix and returns a list of all matching suffixes and their breach counts.
    LRU Cache prevents spamming HIBP for repeated prefixes.
    """
    prefix = prefix.upper()
    if len(prefix) != 5:
        return {"suffixes": [], "error": "Invalid prefix length."}

    url = f"https://api.pwnedpasswords.com/range/{prefix}"
    
    try:
        response = requests.get(url, timeout=5)
        if response.status_code != 200:
            return {"suffixes": [], "note": "API Error, could not check breach status."}

        suffixes_list = []
        for line in response.text.splitlines():
            parts = line.split(':')
            if len(parts) == 2:
                suffixes_list.append({
                    "hash_suffix": parts[0],
                    "count": int(parts[1])
                })
                
        return {"suffixes": suffixes_list}
        
    except Exception as e:
         return {"suffixes": [], "error": str(e)}