# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import wav2vec2, whisper, health
from app.config import settings

app = FastAPI(title="Speech-to-Text Backend", debug=settings.DEBUG)

# Aggiungo CORS middleware per permettere connessioni dal frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Includo i router
app.include_router(wav2vec2.router, prefix="/wav2vec2", tags=["wav2vec2"])
app.include_router(whisper.router, prefix="/whisper", tags=["whisper"])
app.include_router(health.router, prefix="/health", tags=["health"])

@app.get("/")
async def root():
    return {"message": "Speech-to-Text backend is running", "status": "ok"}
