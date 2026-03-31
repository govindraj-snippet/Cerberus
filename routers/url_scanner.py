# routers/url_scanner.py
from fastapi import APIRouter
from pydantic import BaseModel
from services.safe_browsing import check_safe_browsing
from services.ml_feature_extractor import mock_ml_predict

router = APIRouter()

class URLRequest(BaseModel):
    url: str

@router.post("/scan")
async def scan_url(req: URLRequest):
    # 1. Check known databases (Google Safe Browsing)
    db_check = check_safe_browsing(req.url)
    
    # 2. Run AI/Heuristic zero-day analysis
    ai_check = mock_ml_predict(req.url)
    
    return {
        "url": req.url,
        "database_check": db_check,
        "ai_analysis": ai_check
    }