from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.password_eval import analyze_password_strength

# Make sure to import your HIBP database check function here! 
# Example: from services.database_check import check_hibp_breach

router = APIRouter()

class PasswordRequest(BaseModel):
    password: str
    name: Optional[str] = None
    username: Optional[str] = None
    dob: Optional[str] = None
    email: Optional[str] = None

@router.post("/api/password/check")
def check_password(request: PasswordRequest):
    target_password = request.password
    lower_password = target_password.lower()
    
    # 2. Gather context variables into a clean list
    user_context = []
    if request.name:
        user_context.extend(request.name.lower().split())
    if request.username:
        user_context.append(request.username.lower())
    if request.dob:
        user_context.append(request.dob.lower())
    if request.email:
        user_context.extend(request.email.lower().replace('@', ' ').replace('.', ' ').split())
        
    # 3. Get AI Strength Score
    strength_data = analyze_password_strength(target_password, user_inputs=user_context)
    ai_score = strength_data.get("score", 0)
    
    # 4. Get Database Breach Check (Replace with your actual DB call)
    breach_data = {"breached": False, "breach_count": 0} 
    
    # --- NEW LOGIC: Check if personal info was actually used in the password ---
    uses_personal_info = False
    for info in user_context:
        # We only check chunks that are 3 characters or longer to avoid false positives 
        # (like flagging the number "2" just because it's in their birth year)
        if len(info) >= 3 and info in lower_password:
            uses_personal_info = True
            break
    # -------------------------------------------------------------------------
            
    # 5. Calculate Final Verdict & Dynamic Message
    final_verdict = False
    user_message = ""
    
    if breach_data.get("breached"):
        final_verdict = False
        user_message = "🚨 DANGER: This password has been found in known data breaches. Change it immediately!"
        
    elif ai_score < 4:
        final_verdict = False
        # Give a highly specific warning based on why they failed
        if uses_personal_info:
            user_message = f"⚠️ WARNING: Security Score {ai_score}/4. This password contains your personal information, making it extremely easy to hack."
        else:
            user_message = f"⚠️ WARNING: Security Score {ai_score}/4. This password is too predictable or common. Please use a stronger phrase."
            
    else:
        final_verdict = True
        user_message = "✅ SAFE: This is a strong, highly secure password that has never been breached."

    return {
        "final_verdict": final_verdict,
        "user_message": user_message,
        "strength_analysis": strength_data,
        "breach_check": breach_data
    }