from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import url_scanner, password


app = FastAPI(title="Cerberus API")

# Allow your React/Next.js frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect your route handlers
app.include_router(url_scanner.router)
app.include_router(password.router)