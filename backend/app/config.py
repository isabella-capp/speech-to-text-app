from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra='ignore')
    
    # Server settings
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ]
    
    # Model settings
    whisper_model: str = "base"  # tiny, base, small, medium, large
    # Usa il modello di Jonatas Grosman che è specificamente fine-tuned per l'italiano
    wav2vec2_model: str = "jonatasgrosman/wav2vec2-large-xlsr-53-italian"

settings = Settings()
