# services/ml_feature_extractor.py
import re

def extract_features(url: str) -> dict:
    """Extracts features from a URL for ML classification."""
    return {
        "length": len(url),
        "has_ip": 1 if re.search(r'\d+\.\d+\.\d+\.\d+', url) else 0,
        "has_at_symbol": 1 if "@" in url else 0,
        "hyphen_count": url.count("-"),
        "is_https": 1 if url.startswith("https") else 0
    }

def mock_ml_predict(url: str) -> dict:
    """
    A heuristic stand-in for your ML model. 
    Replace this later by loading a real scikit-learn .pkl model.
    """
    features = extract_features(url)
    risk_score = 0
    
    if features["has_ip"]: risk_score += 40
    if features["has_at_symbol"]: risk_score += 30
    if features["hyphen_count"] > 2: risk_score += 20
    if not features["is_https"]: risk_score += 10
    if features["length"] > 75: risk_score += 10
    
    risk_level = "Safe"
    if risk_score > 30: risk_level = "Suspicious"
    if risk_score > 60: risk_level = "Dangerous"
        
    return {
        "risk_score": min(risk_score, 100),
        "risk_level": risk_level,
        "features_analyzed": features
    }