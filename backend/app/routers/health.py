# backend/app/routers/health.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def health_check():
    return {"status": "healthy", "message": "Backend is running"}

@router.get("/status")
async def status():
    return {
        "status": "ok",
        "service": "Speech-to-Text Backend",
        "version": "1.0.0"
    }
