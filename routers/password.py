from fastapi import APIRouter
from pydantic import BaseModel
from services.hibp_checker import check_pwned_passwords
from services.password_eval import check_password_strength

router = APIRouter()

class PasswordRequest(BaseModel):
    password: str

@router.post("/api/password/check")
def check_password(request: PasswordRequest):
    pwd = request.password
    
    # 1. Gather data from our two security services
    strength_data = check_password_strength(pwd) 
    breach_data = check_pwned_passwords(pwd)
    
    is_breached = breach_data.get("breached", False)
    score = strength_data.get("score", 0)
    
    # 2. Calculate the Final Verdict
    is_safe_to_use = False
    user_message = ""
    
    # Rule 1: Instant failure if found in a data breach
    if is_breached:
        is_safe_to_use = False
        breach_count = breach_data.get("breach_count", "multiple")
        user_message = f"🚨 DANGER: This password has been exposed in {breach_count} known data breaches! Do NOT use it anywhere."
        
    # Rule 2: Strict failure if the score is 3 or lower
    elif score < 4:
        is_safe_to_use = False
        user_message = f"⚠️ WARNING: Security Score {score}/4. This hasn't been breached, but it is not strong enough. Please use a longer, more unpredictable passphrase."
        
    # Rule 3: Only perfect passwords pass
    else:
        is_safe_to_use = True
        user_message = "✅ SAFE: This is a strong, highly secure password that has never been breached. You can confidently use it."

    # 3. Return the clean JSON response
    return {
        "final_verdict": is_safe_to_use,
        "user_message": user_message,
        "strength_analysis": strength_data,
        "breach_check": breach_data
    }