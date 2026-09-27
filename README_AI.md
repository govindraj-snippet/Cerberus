# Cerberus AI Phishing URL Detection Architecture

This document describes the architectural transition from static URL rules to a fully realized Machine Learning prediction pipeline for detecting phishing and malicious URLs in real-time.

## 1. Core Concept

The existing `url_eval.py` uses heuristic "if-then" penalties (e.g., subtracting score if `length > 75` or it contains `login`). A robust AI approach will frame this as a **binary classification problem** (Safe vs Malicious).

We will rely on a split pipeline:
1. **Lightweight Feature Extraction (Lexical)**: Done inline, sub-10ms.
2. **Heavyweight NLP/Vision Processing**: Performed async for advanced threats.

## 2. Feature Engineering Pipeline

Every URL passed into the system must be vectorized. An AI model requires quantifiable inputs.

### A. Lexical Features (Fast)
These are features derived directly from the characters in the URL string:
- **URL Length** (Integer)
- **Entropy** (Float): Shannon entropy of the string to detect randomly generated domains `(e.g., a8c92fjx1.com)`
- **Special Character Count** (Integer): Number of hyphens, dots, `@` symbols. (Hackers use `@` to bypass basic URL parsers).
- **Subdomain Count** (Integer): e.g., `paypal.login.secure.update.com` has 4 subdomains.

### B. Network & Host Features (Medium)
Requires DNS or lightweight HTTP requests:
- **Domain Age** (Integer): Retrieved via WHOIS. Phishing domains are often < 30 days old.
- **SSL Certificate Validity** (Boolean/Integer): Self-signed or free certs (Let's Encrypt) are heavily abused.
- **Redirect Count** (Integer): Follow the URL; 3+ redirects is highly suspicious.

### C. Advanced Content Features (Slow - Asynchronous)
Requires fetching the DOM:
- **Typosquatting NLP**: Levenshtein distance against top 500 Alexa sites (e.g., `goog1e.com` vs `google.com`).
- **Page Similarity (Computer Vision)**: Render a headless browser screenshot, hash the image visually (e.g., using a CNN or perceptual hash), and compare against known brand templates (e.g., checking if it visually looks like a Microsoft login page but the domain isn't microsoft.com).

## 3. Machine Learning Model Design

### Recommended Model: Random Forest Classifier
Why? Interpretability and Speed. 
A Random Forest easily explains *why* it flagged a URL via **Feature Importance** outperforming black-box Deep Learning approaches for typical cybersecurity compliance requirements.

### Model Training Example (Python Mock)

```python
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# 1. Load labeled dataset (e.g., PhishTank + benign URLs)
data = pd.read_csv("url_training_data.csv")
X = data[['length', 'entropy', 'subdomain_count', 'domain_age', 'has_phish_word']]
y = data['label'] # 1 = Phishing, 0 = Safe

# 2. Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Train Model
model = RandomForestClassifier(n_estimators=100, max_depth=10)
model.fit(X_train, y_train)

# 4. Evaluate
predictions = model.predict(X_test)
print(classification_report(y_test, predictions))
```

### 4. Integration into FastAPI Backend

Once the model is trained, export it using `joblib`.

```python
# In ml_feature_extractor.py
import joblib

# Load in memory on startup
ai_model = joblib.load("phish_random_forest.pkl")

def mock_ml_predict(url: str) -> dict:
    # 1. Pipeline the URL into features
    features = extract_lexical_features(url)
    
    # 2. Convert to DataFrame / Array
    vector = [features['len'], features['entropy'], features['sub_count']]
    
    # 3. Model Predict
    prob = ai_model.predict_proba([vector])[0][1] # Probability of being class 1
    
    return {
        "risk_score": int(prob * 100),
        "risk_level": "High" if prob > 0.6 else "Safe",
        "features_analyzed": features
    }
```

## 5. Federated & Ongoing Learning
To prevent the model from drifting:
- Users can "Report False Positive".
- Reported URLs enter a Kafka queue.
- Nightly cron job re-labels and re-trains the model incrementally.
