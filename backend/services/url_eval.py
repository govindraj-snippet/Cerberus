import re

def analyze_url_heuristics(url: str) -> dict:
    risk_score = 0
    lower_url = url.lower()
    
    # 1. HTTPS Check
    is_https = 1 if lower_url.startswith("https://") else 0
    if not is_https:
        risk_score += 30
        
    # 2. Length Check
    length = len(url)
    if length > 75:
        risk_score += 20
    elif length > 50:
        risk_score += 10
        
    # 3. Phishing Keyword Detection
    suspicious_keywords = [
        'login', 'verify', 'update', 'account', 'secure', 
        'paypal', 'bank', 'auth', 'support', 'wallet'
    ]
    for word in suspicious_keywords:
        if word in lower_url:
            risk_score += 15
            
    # 4. Hyphen Spam Detection
    hyphen_count = url.count('-')
    if hyphen_count > 3:
        risk_score += 15
        
    # 5. IP Address Detection
    if re.search(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', url):
        risk_score += 40
        
    # Cap the maximum score at 100
    risk_score = min(risk_score, 100)
    
    # Determine the Risk Category
    if risk_score >= 50:
        risk_level = "High"
    elif risk_score >= 30:
        risk_level = "Mild"
    else:
        risk_level = "Safe"
        
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "features_analyzed": {
            "length": length,
            "is_https": is_https,
            "hyphen_count": hyphen_count
        }
    }