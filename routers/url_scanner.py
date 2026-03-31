from fastapi import APIRouter
from pydantic import BaseModel
from services.safe_browsing import check_safe_browsing
from services.ml_feature_extractor import mock_ml_predict

router = APIRouter()

class URLRequest(BaseModel):
    url: str

@router.post("/api/url/scan") 
def scan_url(request: URLRequest):
    url_to_check = request.url
    
    db_result = check_safe_browsing(url_to_check)
    ai_result = mock_ml_predict(url_to_check) 
    
    is_safe = False
    user_message = ""
    risk_score = ai_result.get("risk_score", 0)
    
    if db_result.get("is_safe") is False:
        is_safe = False
        threat_type = db_result.get("threat_type", "Malware/Phishing")
        user_message = f"🚨 DANGER: This website has been flagged as a known threat ({threat_type}). Do NOT visit this link!"
        
    elif risk_score >= 40:
        is_safe = False
        user_message = f"⚠️ WARNING: Our AI detected suspicious patterns (Risk Score: {risk_score}/100). Proceed with caution."
        
    else:
        is_safe = True
        user_message = "✅ SAFE: This website checks out as completely safe. You can browse it with confidence."
        
    return {
        "url": url_to_check,
        "final_verdict": is_safe,
        "user_message": user_message,
        "database_check": db_result,
        "ai_analysis": ai_result
    }