# 🛡️ Cerberus Security Engine (Backend)

Cerberus is a high-performance cybersecurity intelligence API built with **FastAPI**. It provides real-time threat detection for URLs and passwords using a **Zero-Knowledge Architecture** and **Predictive Machine Learning**.

---

## 🚀 Key Features

### 1. Zero-Knowledge Password Evaluation
*   **Privacy-First Design**: Cerberus never sees your raw password. The client hashes the password locally (SHA-1) and sends only the **first 5 characters** (the prefix) to the API.
*   **k-Anonymity**: The server proxies this prefix to the *Have I Been Pwned* DB and returns 500+ possible matches. The client then performs the final match locally in the browser.
*   **Production Strength**: Combines local `zxcvbn` heuristics with billion-entry breach databases.

### 2. Predictive URL Threat Intelligence
*   **Machine Learning (Random Forest)**: Powered by a custom-trained Scikit-Learn model using a real-world phishing dataset.
*   **Lexical Analysis**: Analyzes 15 mathematical features of every URL, including entropy, digit density, and structural depth to detect "Zero-Day" phishing sites that are not yet blacklisted.
*   **Multi-Layer Defense**: Integrates **VirusTotal** deterministic database checks with local behavioral AI.

---

## 💻 Tech Stack

*   **FastAPI**: Asynchronous Python web framework.
*   **Scikit-Learn**: Powering the Random Forest ML Classifier.
*   **Pandas**: For advanced feature engineering during training.
*   **Joblib**: For high-speed serialized model inference.
*   **LRU Caching**: Integrated into service layers to mitigate network latency.

---

## 🛠️ Installation & Setup

**1. Create & Activate Virtual Environment**
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

**2. Install Production Dependencies**
```bash
pip install -r requirements.txt
```

**3. Initial Model Training**
The system requires a trained "Brain" to run URL analytics.
```bash
python train_model.py
```

**4. Start the Engine**
```bash
python main.py
```
*API is live at `http://localhost:8000`. Documentation at `/docs`.*

---

## 📖 API Reference

### 🔍 URL Scan
`POST /api/url/scan`
Analyzes a URL for malicious patterns using ML + VirusTotal.

**Request:**
```json
{ "url": "https://secure-login-verify-paypal.com" }
```

### 🔑 Password Breach Proxy
`GET /api/password/breach-check/{prefix}`
Accepts a 5-char SHA-1 prefix for Zero-Knowledge verification.

---

## 🔐 Security & Privacy
*   **No Persistence**: Cerberus caches threat data in memory but never stores user inputs (URLs or Hashes) in a database.
*   **Encrypted Inference**: All ML calculations are performed locally on the server without external data transmission.
