def analyze_url_heuristics(url: str) -> dict:
    risk_score = 0
    url_lower = url.lower()
    
    # 1. Structural Checks
    length = len(url)
    if length > 75:
        risk_score += 20
        
    is_https = 1 if url.startswith("https://") else 0
    if not is_https:
        risk_score += 40
        
    hyphen_count = url.count("-")
    if hyphen_count >= 4:
        risk_score += 20
        
    # --- NEW FIX: PHISHING KEYWORD ANALYSIS ---
    # These words are heavily abused by hackers in fake URLs
    suspicious_keywords = [
        "phishing", "login", "verify", "secure", "account", 
        "update", "banking", "password", "wallet", "support",
        "credential", "auth"
    ]
    
    found_keywords = []
    for word in suspicious_keywords:
        if word in url_lower:
            risk_score += 40  # Massive penalty for using these words!
            found_keywords.append(word)

    # ------------------------------------------

    # Cap the maximum score at 100
    risk_score = min(risk_score, 100)
    
    # Calculate Risk Level
    if risk_score >= 60:
        risk_level = "High"
    elif risk_score >= 30:
        risk_level = "Medium"
    else:
        risk_level = "Safe"
        
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "features_analyzed": {
            "length": length,
            "is_https": is_https,
            "hyphen_count": hyphen_count,
            "suspicious_words": found_keywords  # Shows the user exactly which words triggered the AI
        }
    }