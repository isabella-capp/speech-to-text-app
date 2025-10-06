# backend/app/routers/health.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def status():
    """
    Endpoint di health check dettagliato per monitoraggio.
    """
    return {
        "status": "ok",
        "message": "Backend is running",
        "service": "Speech-to-Text Backend",
        "version": "1.0.0"
    }
