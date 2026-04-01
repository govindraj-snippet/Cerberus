
# 🛡️ Cybersecurity Analysis API

A lightweight, high-performance API built with FastAPI that provides real-time security evaluations. It features a zero-knowledge password checker (verifying against known data breaches and calculating cryptographic strength) and an intelligent URL scanner that uses heuristic AI analysis to detect phishing and malware risks.

---

## 💻 Tech Stack & Libraries

This project uses the following core libraries:
* **FastAPI:** The high-performance web framework for the API.
* **Uvicorn:** The ASGI web server to run FastAPI.
* **Requests:** For secure, external API calls (Have I Been Pwned).
* **zxcvbn:** Dropbox's AI-driven password strength and entropy estimator.
* **Pydantic:** For strict data validation.

---

## Installation & Setup

**1. Clone the repository**
```bash
git clone [https://github.com/yourusername/your-repo-name.git](https://github.com/yourusername/your-repo-name.git)
cd your-repo-name
```

**2. Create a Virtual Environment**
It is highly recommended to run this project inside a virtual environment to keep dependencies organized.
```bash
python -m venv venv
```

**3. Activate the Virtual Environment**
* **Windows:**
  ```bash
  venv\Scripts\activate
  ```
* **Mac/Linux:**
  ```bash
  source venv/bin/activate
  ```

**4. Install Dependencies**
Use the included `requirements.txt` file to install all necessary security libraries and server frameworks.
```bash
pip install -r requirements.txt
```

**5. Run the Server**
Start the FastAPI application using Uvicorn.
```bash
uvicorn main:app --reload
```

*The API will now be running locally. You can view the interactive Swagger documentation and test your endpoints at: `http://127.0.0.1:8000/docs`*

---

## 📖 API Endpoints

### 1. Check Password Security
Evaluates a password for its cryptographic strength and checks if it has been exposed in a known data breach.

* **URL:** `/api/password/check`
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "password": "PurpleElephantsDanceAtMidnight!"
}
```

**Success Response:**
```json
{
  "final_verdict": true,
  "user_message": "✅ SAFE: This is a strong, highly secure password that has never been breached. You can confidently use it.",
  "strength_analysis": {
    "score": 4,
    "max_score": 4,
    "feedback": [
      "This password is highly secure and unpredictable!"
    ],
    "estimated_guesses_to_crack": 15000000000000
  },
  "breach_check": {
    "breached": false,
    "breach_count": 0
  }
}
```

---

### 2. Scan URL for Threats
Analyzes a URL for missing encryption, phishing keywords, suspicious lengths, and checks it against known threat databases.

* **URL:** `/api/url/scan`
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "url": "[http://login-update-account-security-check-paypal-verify.com](http://login-update-account-security-check-paypal-verify.com)"
}
```

**Success Response:**
```json
{
  "url": "[http://login-update-account-security-check-paypal-verify.com](http://login-update-account-security-check-paypal-verify.com)",
  "final_verdict": false,
  "user_message": "⚠️ WARNING: Our AI detected severe suspicious patterns (Risk Score: 100/100). Proceed with extreme caution.",
  "database_check": {
    "is_safe": true,
    "note": "URL not found in malicious database."
  },
  "ai_analysis": {
    "risk_score": 100,
    "risk_level": "High",
    "features_analyzed": {
      "length": 60,
      "is_https": 0,
      "hyphen_count": 6
    }
  }
}
```
```
