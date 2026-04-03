# Cybersecurity Analysis API and Dashboard

## Project Overview
This is a full-stack cybersecurity analysis tool designed to evaluate the safety of passwords and URLs in real-time. The project features a Python (FastAPI) backend for performing the security math and database queries, and a React frontend for displaying the results in a clean, split-screen dashboard.

This tool does not just rely on basic rules; it uses heuristic analysis and context-awareness to detect modern hacking tactics.

---

## Core Security Engines (What We Used)

To make our security checks as accurate as possible, we relied on industry-standard tools and custom algorithms:

### 1. What we used to check Passwords:
* **zxcvbn (by Dropbox):** We used this open-source algorithm to calculate password strength. Instead of just counting characters, it acts like a password cracker, looking for common patterns, keyboard walks (like "qwerty"), and dictionary words. We also feed user context (name, birth year) into it so it can detect if a user is using their own personal info.
* **Have I Been Pwned (HIBP) API:** We used this massive, free global database of over 12 billion leaked passwords to check if the password has already been hacked by cybercriminals.

### 2. What we used to check URLs:
* **Custom Python Heuristic Engine:** Since hackers constantly change malicious URLs to avoid being blocked, we built a custom mathematical scanner using Python's `re` (Regex) and string analysis. 
* It actively scans for:
  - Missing encryption (HTTP vs HTTPS).
  - High-risk keywords used to panic users ("login", "verify", "secure").
  - Structural anomalies (too many hyphens, excessive length).
  - Evasion tactics (Naked IP addresses, URL shorteners, and sketchy Top-Level Domains like .xyz).

---

## How It Works Behind the Scenes

### 1. The Password Evaluator
Most password checkers just look for a capital letter and a number. Ours is much smarter.
* **Context-Aware AI:** By passing the user's personal information into the zxcvbn engine, the system instantly flags predictable passwords that include names or birthdates.
* **Data Breach Check (k-Anonymity):** When we query the Have I Been Pwned database, we never send the actual password over the internet. We hash the password (SHA-1), chop it into two pieces, and only send the first 5 characters to the database. We do the final matching locally. This guarantees absolute privacy.

### 2. The URL Threat Scanner
Hackers often use links that look safe to the human eye. Our URL scanner acts like an antivirus engine for web links.
* **Score-Based System:** Our custom engine assigns penalty points for every sketchy detail it finds. If the score crosses a certain threshold, it flags the link as a threat.
* **Performance:** The backend uses in-memory caching to remember recent scans, preventing our server from being overloaded by identical requests.

---

## Tech Stack

**Backend**
* Framework: FastAPI (Python)
* Server: Uvicorn
* Libraries: requests (for HIBP API), zxcvbn (for password strength), pydantic (for data validation).

**Frontend**
* Framework: React.js (built with Vite for speed)
* Styling: Tailwind CSS
* Layout: Split-screen desktop design (URL Scanner on the left, Password Checker on the right).

---

## Folder Structure

The project is structured as a monolithic repository containing both the frontend and backend.

/ (Root Directory)
|-- /backend
|   |-- main.py (Entry point for the API)
|   |-- /routers
|   |   |-- password.py (API endpoints for password checking)
|   |-- /services
|       |-- password_eval.py (zxcvbn logic)
|       |-- url_eval.py (Heuristic scanning logic)
|       |-- database_check.py (k-Anonymity HIBP logic)
|
|-- /frontend
|   |-- package.json
|   |-- /src
|       |-- App.jsx (Main React interface)
|       |-- index.css (Tailwind configuration)
|
|-- .gitignore

---

## Setup and Installation Guide

You will need to run two separate terminals to start this project: one for the backend server and one for the frontend UI.

### Step 1: Start the Backend (Terminal 1)
1. Open a terminal and navigate into the backend folder:
   `cd backend`
2. Create and activate a virtual environment (Recommended):
   Windows: `python -m venv venv` and then `venv\Scripts\activate`
   Mac/Linux: `python3 -m venv venv` and then `source venv/bin/activate`
3. Install the required Python packages:
   `pip install fastapi uvicorn requests zxcvbn pydantic`
4. Start the server:
   `uvicorn main:app --reload`
The API will now be running at http://127.0.0.1:8000. You can view the API documentation at http://127.0.0.1:8000/docs.

### Step 2: Start the Frontend (Terminal 2)
1. Open a new terminal and navigate into the frontend folder:
   `cd frontend`
2. Install the Node.js dependencies:
   `npm install`
3. Start the Vite development server:
   `npm run dev`
The React frontend will now be running (usually at http://localhost:5173). Open that link in your browser to use the tool.
