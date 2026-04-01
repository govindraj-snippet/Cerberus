from fastapi import APIRouter
from pydantic import BaseModel
# Keep your existing database import here! Example:
# from services.database_check import check_url_in_db 
from services.url_eval import analyze_url_heuristics

router = APIRouter()

class URLRequest(BaseModel):
    url: str

@router.post("/api/url/scan")
def scan_url(request: URLRequest):
    target_url = request.url
    
    # 1. Get the AI Heuristics Analysis
    ai_data = analyze_url_heuristics(target_url)
    ai_score = ai_data.get("risk_score", 0)
    
    # 2. Get Database Check
    # Replace the mock dictionary below with your ACTUAL database function call
    # Example: db_data = check_url_in_db(target_url)
    
    # --- MOCK DB LOGIC (Remove this when you hook up your real database function) ---
    db_data = {"is_safe": True, "note": "URL not found in malicious database."}
    if "amtso.org" in target_url:
        db_data = {"is_safe": False, "threat_type": "MALWARE/PHISHING", "details": "Flagged as dangerous by 12 vendors."}
    # ---------------------------------------------------------------------------------
    
    db_is_safe = db_data.get("is_safe", True)
    
    # 3. Calculate Final Verdict & Message
    final_verdict = False
    user_message = ""
    
    # Rule A: Instant failure if the database (like VirusTotal) flags it
    if not db_is_safe:
        final_verdict = False
        user_message = "DANGER: This website has been flagged as a known threat (MALWARE/PHISHING). Do NOT visit this link!"
        
    # Rule B: AI catches severe suspicious patterns (Score 50+)
    elif ai_score >= 50:
        final_verdict = False
        user_message = f" WARNING: Our AI detected severe suspicious patterns (Risk Score: {ai_score}/100). Proceed with extreme caution."
        
    # Rule C: AI catches minor issues, like missing HTTPS (Score 30-49)
    elif ai_score >= 30:
        final_verdict = True 
        user_message = f" MILD RISK: This site isn't flagged as malicious, but it lacks encryption or has minor suspicious traits (Risk Score: {ai_score}/100). Do not enter passwords here."
        
    # Rule D: Clean bill of health
    else:
        final_verdict = True
        user_message = "SAFE: This website checks out as completely safe. You can browse it with confidence."

    # 4. Return Data
    return {
        "url": target_url,
        "final_verdict": final_verdict,
        "user_message": user_message,
        "database_check": db_data,
        "ai_analysis": ai_data
    }