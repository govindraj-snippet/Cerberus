def mock_ml_predict(url: str) -> dict:
    # A lightweight AI/Heuristic mock engine for the URL scanner
    is_https = 1 if url.startswith("https") else 0
    length = len(url)
    risk_score = 0
    
    # Penalize if it's not secure
    if not is_https:
        risk_score += 30
        
    # Penalize if it's abnormally long
    if length > 75:
        risk_score += 20
        
    return {
        "risk_score": risk_score,
        "risk_level": "High" if risk_score >= 40 else "Safe",
        "features_analyzed": {
            "length": length,
            "is_https": is_https
        }
    }