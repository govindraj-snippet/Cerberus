import os
import joblib
import numpy as np
from utils import calculate_entropy, PHISH_KEYWORDS

# Load the AI Brain once into memory when the server starts
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "phish_rf_model.pkl"))

print(f"[*] AI Engine: Attempting to load model from {MODEL_PATH}")

try:
    if os.path.exists(MODEL_PATH):
        rf_model = joblib.load(MODEL_PATH)
        print("[+] AI Engine: Random Forest model loaded successfully.")
    else:
        print(f"[!] AI Engine: Model file NOT FOUND at {MODEL_PATH}")
        rf_model = None
except Exception as e:
    print(f"[!] AI Engine: Failed to load model. Error: {e}")
    rf_model = None

def get_lexical_features(url):
    """Calculates lexical features from URL string to match dataset columns."""
    url_lower = str(url).lower()
    hostname = url_lower.split("//")[-1].split("/")[0] if "//" in url_lower else url_lower.split("/")[0]
    
    digits_url = sum(c.isdigit() for c in url_lower)
    digits_host = sum(c.isdigit() for c in hostname)
    
    # Identify common phishing keywords in the URL (Matches train_model.py)
    phish_hints = sum(1 for word in PHISH_KEYWORDS if word in url_lower)
    
    features = [
        len(url_lower),             # length_url
        url_lower.count('.'),       # nb_dots
        url_lower.count('-'),       # nb_hyphens
        url_lower.count('@'),       # nb_at
        url_lower.count('?'),       # nb_qm
        url_lower.count('&'),       # nb_and
        url_lower.count('='),       # nb_eq
        url_lower.count('_'),       # nb_underscore
        url_lower.count('/'),       # nb_slash
        url_lower.count(':'),       # nb_colon
        url_lower.count('.com'),    # nb_com
        url_lower.count('www'),      # nb_www
        digits_url / len(url_lower) if len(url_lower) > 0 else 0,
        digits_host / len(hostname) if len(hostname) > 0 else 0,
        calculate_entropy(url_lower),
        phish_hints                 # phish_hints (Feature 16)
    ]
    return features

def predict_url_safety(url: str) -> dict:
    features = get_lexical_features(url)
    
    if not rf_model:
        return {
            "risk_score": 0,
            "risk_level": "Error (Model Not Trained)",
            "features_analyzed": {"url": url}
        }
        
    X = np.array([features])
    
    # Predict Probability of class '1' (Phishing/Bad)
    probabilities = rf_model.predict_proba(X)[0]
    risk_prob = probabilities[1] * 100 
    
    if risk_prob >= 75:
        risk_level = "High"
    elif risk_prob >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Safe"
        
    return {
        "risk_score": round(risk_prob),
        "risk_level": risk_level,
        "features_analyzed": {
            "length": features[0],
            "dots": features[1],
            "hyphens": features[2],
            "special_chars": features[3] + features[4] + features[7],
            "entropy": round(features[14], 2),
            "phish_hints": features[15]
        }
    }