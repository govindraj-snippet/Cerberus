from fastapi import APIRouter
from pydantic import BaseModel
from services.safe_browsing import check_safe_browsing
from services.ml_feature_extractor import predict_url_safety

router = APIRouter()

class URLRequest(BaseModel):
    url: str

@router.post("/api/url/scan")
def scan_url(request: URLRequest):
    target_url = request.url
    
    # 1. Get the LIVE ML AI Analysis
    ai_data = predict_url_safety(target_url)
    ai_score = ai_data.get("risk_score", 0)
    
    # 2. Get Database Check
    # 2. Get Database Check using VirusTotal API (graceful fallback if NO API KEY)
    db_data = check_safe_browsing(target_url)
    
    db_is_safe = db_data.get("is_safe", True)
    
    # 3. Calculate Final Verdict & Message
    # Thresholds are aligned with the 15-feature RF Model precision
    final_verdict = False
    user_message = ""
    
    # Priority 1: Database matches (Deterministic intelligence)
    if not db_is_safe:
        final_verdict = False
        user_message = "CRITICAL: This URL is blacklisted in our threat intelligence databases. Access has been denied for your protection."
        
    # Priority 2: High AI Score (75%+) - Deep Phishing Patterns detected
    elif ai_score >= 75:
        final_verdict = False
        user_message = f"DANGER: Our Zero-Day AI detected high-confidence phishing patterns (Risk: {ai_score}%). This site is likely a credential harvester."
        
    # Priority 3: Medium AI Score (40% - 74%) - Suspicious Structure
    elif ai_score >= 40:
        final_verdict = True # Allow but warn
        user_message = f"CAUTION: While not blacklisted, this URL has suspicious lexical traits (Risk: {ai_score}%). Verify the sender before clicking."
        
    # Priority 4: Clean
    else:
        final_verdict = True
        user_message = "SECURE: No malicious signatures or zero-day patterns detected. The link appears safe for navigation."

    # 4. Return Data
    return {
        "url": target_url,
        "final_verdict": final_verdict,
        "user_message": user_message,
        "database_check": db_data,
        "ai_analysis": ai_data
    }