"""
Configurazione dell'applicazione Speech-to-Text.

Gestisce le impostazioni globali dell'applicazione utilizzando Pydantic
per la validazione e il caricamento da variabili d'ambiente.
"""

from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List


class Settings(BaseSettings):
    """
    Configurazione dell'applicazione.
    
    Carica le impostazioni da variabili d'ambiente con fallback ai valori di default.
    Supporta il caricamento da file .env per lo sviluppo locale.
    """
    
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
    
    def get_server_url(self) -> str:
        """
        Ottieni l'URL completo del server.

        Returns:
            URL del server nel formato http://host:port.
        """
        return f"http://{self.HOST}:{self.PORT}"


# Istanza singleton delle impostazioni
settings = Settings()
