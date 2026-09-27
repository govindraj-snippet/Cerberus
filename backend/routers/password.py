from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.hibp_checker import check_pwned_passwords_prefix

router = APIRouter()

@router.get("/api/password/breach-check/{prefix}")
def pass_breach_check(prefix: str):
    """
    Privacy Gateway Endpoint:
    Accepts ONLY a 5-character SHA-1 hash prefix. Over 99% of the hash NEVER leaves the client.
    """
    # if len(prefix) != 5:
    #     raise HTTPException(status_code=400, detail="Invalid prefix length. Must be exactly 5 characters.")
        
    data = check_pwned_passwords_prefix(prefix)
    
    if "error" in data:
        raise HTTPException(status_code=500, detail=data["error"])
        
    return data