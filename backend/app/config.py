# backend/app/config.py
import os
from typing import Optional

class Settings:
    # Server settings
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Model settings
    DEVICE: str = "cuda" if os.getenv("FORCE_CPU", "False").lower() != "true" else "cpu"
    
    # Wav2Vec2 settings
    WAV2VEC2_MODEL: str = os.getenv("WAV2VEC2_MODEL", "facebook/wav2vec2-large-960h-lv60-self")
    
    # Whisper settings  
    WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "small")
    
    # Audio settings
    SAMPLE_RATE: int = 16000
    BUFFER_SIZE: int = 48000 * 2 * 3  # 3 seconds at 16kHz 16-bit
    
    # CORS settings
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
settings = Settings()
