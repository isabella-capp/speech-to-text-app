"""
Applicazione FastAPI per il riconoscimento vocale automatico.

Questa applicazione fornisce API REST per la trascrizione di file audio
utilizzando modelli di machine learning avanzati (Wav2Vec2 e Whisper).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import route_wav2vec2, route_whisper, route_models, health
from app.config import settings

app = FastAPI(
    title="Speech-to-Text Backend", 
    description="API per la trascrizione automatica di audio in testo",
    version="1.0.0",
    debug=settings.DEBUG
)

# Aggiungo CORS middleware per permettere connessioni dal frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Includo i router
app.include_router(route_wav2vec2.router, prefix="/wav2vec2", tags=["wav2vec2"])
app.include_router(route_whisper.router, prefix="/whisper", tags=["whisper"])
app.include_router(route_models.router, prefix="/models", tags=["models"])
app.include_router(health.router, prefix="/health", tags=["health"])