import pandas as pd
import numpy as np
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
from utils import calculate_entropy, PHISH_KEYWORDS

def get_lexical_features(url):
    """Calculates lexical features from URL string to match dataset columns."""
    url = str(url).lower()
    hostname = url.split("//")[-1].split("/")[0] if "//" in url else url.split("/")[0]
    
    digits_url = sum(c.isdigit() for c in url)
    digits_host = sum(c.isdigit() for c in hostname)
    
    # Identify common phishing keywords in the URL
    phish_hints = sum(1 for word in PHISH_KEYWORDS if word in url)
    
    return [
        len(url),                   # length_url
        url.count('.'),             # nb_dots
        url.count('-'),             # nb_hyphens
        url.count('@'),             # nb_at
        url.count('?'),             # nb_qm
        url.count('&'),             # nb_and
        url.count('='),             # nb_eq
        url.count('_'),             # nb_underscore
        url.count('/'),             # nb_slash
        url.count(':'),             # nb_colon
        url.count('.com'),          # nb_com
        url.count('www'),            # nb_www
        digits_url / len(url) if len(url) > 0 else 0,       # ratio_digits_url
        digits_host / len(hostname) if len(hostname) > 0 else 0, # ratio_digits_host
        calculate_entropy(url),      # custom entropy feature
        phish_hints                  # phish_hints (New 16th Feature)
    ]

def main():
    print("[*] Cerberus ML Pipeline: Advanced Training Logic")
    dataset_path = os.path.join(os.path.dirname(__file__), "dataset", "output_file.csv")
    
    if not os.path.exists(dataset_path):
        print(f"[!] Error: Dataset not found at {dataset_path}")
        return

    print(f"[*] Loading Kaggle Dataset: {dataset_path}...")
    df = pd.read_csv(dataset_path)
    
    # Target mapping
    print("[*] Preprocessing labels...")
    df['target'] = df['status'].map({'phishing': 1, 'legitimate': 0})
    
    # We will train the model based on lexical features of the raw URL
    # to ensure the model can work with just a string input in production.
    print("[*] Extracting 15 lexical features from URLs...")
    urls = df['url'].tolist()
    y = df['target'].values
    
    X = np.array([get_lexical_features(u) for u in urls])
    
    # Split for validation
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print(f"[*] Training on {len(X_train)} samples, Validating on {len(X_test)} samples...")
    clf = RandomForestClassifier(n_estimators=150, max_depth=20, random_state=42)
    clf.fit(X_train, y_train)

    # Validate
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"[*] Validation Accuracy: {acc * 100:.2f}%")
    print("[*] Detailed Report:")
    print(classification_report(y_test, y_pred))

    # Save model
    model_path = "phish_rf_model.pkl"
    joblib.dump(clf, model_path)
    print(f"[*] Model saved to {model_path}")

if __name__ == "__main__":
    main()
