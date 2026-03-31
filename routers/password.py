# routers/password.py
from fastapi import APIRouter
from pydantic import BaseModel
from services.password_eval import evaluate_strength
from services.hibp_checker import check_breach

router = APIRouter()

class PasswordRequest(BaseModel):
    password: str

@router.post("/analyze")
async def analyze_password(req: PasswordRequest):
    strength_data = evaluate_strength(req.password)
    breach_data = check_breach(req.password)
    
    return {
        "strength": strength_data,
        "exposure": breach_data,
        "actionable_advice": strength_data["suggestions"]
    }