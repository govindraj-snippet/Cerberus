from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import url_scanner, password

# Cerberus Security Engine
# Author: HackSpectra Project
# Version: 1.0.0 (Kaggle-Trained ML + Zero-Knowledge Architecture)

app = FastAPI(
    title="Cerberus Security API",
    description="Multi-layer Cybersecurity Intelligence with Predictive ML and Zero-Knowledge Privacy.",
    version="1.0.0"
)

# CORS Configuration
# [PRODUCTION NOTE]: Replace "*" with your specific frontend domain in production (e.g. https://cerberus-app.com)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Component Integration
app.include_router(url_scanner.router, tags=["Threat Scanner"])
app.include_router(password.router, tags=["Password Intelligence"])

if __name__ == "__main__":
    import uvicorn
    # High-performance server initialization
    print("[*] Cerberus API Starting...")
    uvicorn.run(app, host="127.0.0.1", port=8000)