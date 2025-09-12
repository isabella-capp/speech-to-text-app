"""
Manager centralizzato per la gestione dei modelli ASR.

Questo modulo implementa il pattern Singleton per la gestione centralizzata
dei modelli ASR, seguendo i principi SOLID.
"""

from typing import Dict, Any, Optional
from enum import Enum


class ModelSize(Enum):
    """Enumerazione per le dimensioni dei modelli."""
    TINY = "tiny"
    SMALL = "small"
    BASE = "base"
    MEDIUM = "medium"
    LARGE = "large"


class ASRModelManager:
    """
    Manager singleton per la gestione centralizzata dei modelli ASR.
    
    Gestisce i modelli Wav2Vec2 e Whisper, permettendo il cambio dinamico
    e la configurazione centralizzata.
    """
    
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ASRModelManager, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        """Inizializza il manager (solo una volta)."""
        if not self._initialized:
            self._wav2vec2_models = self._initialize_wav2vec2_models()
            self._whisper_models = self._initialize_whisper_models()
            self._current_wav2vec2_model = "facebook"
            self._current_whisper_model = ModelSize.BASE
            ASRModelManager._initialized = True

    def _initialize_wav2vec2_models(self) -> Dict[str, Dict[str, Any]]:
        """
        Inizializza la configurazione dei modelli Wav2Vec2.

        Returns:
            Dizionario con i modelli Wav2Vec2 configurati per l'italiano.
        """
        return {
            "facebook": {
                "name": "facebook/wav2vec2-large-xlsr-53-italian",
                "description": "Modello ufficiale Facebook per l'italiano",
                "quality": "alto",
                "size": "grande",
                "language": "it"
            },
            "jonatas": {
                "name": "jonatasgrosman/wav2vec2-large-xlsr-53-italian",
                "description": "Modello fine-tuned specifico per l'italiano",
                "quality": "molto alto",
                "size": "grande",
                "language": "it"
            },
            "lightweight": {
                "name": "leandroreturns/wav2vec2-xlsr-italian",
                "description": "Modello più leggero per l'italiano",
                "quality": "medio",
                "size": "medio",
                "language": "it"
            }
        }

    def _initialize_whisper_models(self) -> Dict[ModelSize, Dict[str, Any]]:
        """
        Inizializza la configurazione dei modelli Whisper.

        Returns:
            Dizionario con i modelli Whisper supportati.
        """
        return {
            ModelSize.TINY: {
                "name": "tiny",
                "description": "Modello più piccolo e veloce",
                "quality": "basso",
                "size": "39 MB",
                "multilingual": True
            },
            ModelSize.BASE: {
                "name": "base",
                "description": "Modello bilanciato",
                "quality": "medio",
                "size": "142 MB",
                "multilingual": True
            },
            ModelSize.SMALL: {
                "name": "small",
                "description": "Modello piccolo con buona qualità",
                "quality": "buono",
                "size": "483 MB",
                "multilingual": True
            },
            ModelSize.MEDIUM: {
                "name": "medium",
                "description": "Modello medio con alta qualità",
                "quality": "alto",
                "size": "1.5 GB",
                "multilingual": True
            },
            ModelSize.LARGE: {
                "name": "large",
                "description": "Modello più grande e accurato",
                "quality": "molto alto",
                "size": "3.1 GB",
                "multilingual": True
            }
        }

    def get_wav2vec2_model_info(self, model_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Ottieni informazioni su un modello Wav2Vec2.

        Args:
            model_key: Chiave del modello. Se None, usa quello attuale.

        Returns:
            Dizionario con le informazioni del modello.

        Raises:
            KeyError: Se il modello non esiste.
        """
        key = model_key or self._current_wav2vec2_model
        if key not in self._wav2vec2_models:
            raise KeyError(f"Modello Wav2Vec2 '{key}' non trovato")
        return self._wav2vec2_models[key]

    def get_whisper_model_info(self, model_size: Optional[ModelSize] = None) -> Dict[str, Any]:
        """
        Ottieni informazioni su un modello Whisper.

        Args:
            model_size: Dimensione del modello. Se None, usa quello attuale.

        Returns:
            Dizionario con le informazioni del modello.

        Raises:
            KeyError: Se il modello non esiste.
        """
        size = model_size or self._current_whisper_model
        if size not in self._whisper_models:
            raise KeyError(f"Modello Whisper '{size}' non trovato")
        return self._whisper_models[size]

    def set_wav2vec2_model(self, model_key: str) -> bool:
        """
        Imposta il modello Wav2Vec2 di default.

        Args:
            model_key: Chiave del modello da impostare.

        Returns:
            True se l'operazione è riuscita.

        Raises:
            KeyError: Se il modello non esiste.
        """
        if model_key not in self._wav2vec2_models:
            raise KeyError(f"Modello Wav2Vec2 '{model_key}' non trovato")
        self._current_wav2vec2_model = model_key
        return True

    def set_whisper_model(self, model_size: ModelSize) -> bool:
        """
        Imposta il modello Whisper di default.

        Args:
            model_size: Dimensione del modello da impostare.

        Returns:
            True se l'operazione è riuscita.

        Raises:
            KeyError: Se il modello non esiste.
        """
        if model_size not in self._whisper_models:
            raise KeyError(f"Modello Whisper '{model_size}' non trovato")
        self._current_whisper_model = model_size
        return True

    def get_current_wav2vec2_model(self) -> str:
        """
        Ottieni la chiave del modello Wav2Vec2 attualmente attivo.

        Returns:
            Chiave del modello attuale.
        """
        return self._current_wav2vec2_model

    def get_current_whisper_model(self) -> ModelSize:
        """
        Ottieni la dimensione del modello Whisper attualmente attivo.

        Returns:
            Dimensione del modello attuale.
        """
        return self._current_whisper_model

    def get_all_wav2vec2_models(self) -> Dict[str, Dict[str, Any]]:
        """
        Ottieni tutti i modelli Wav2Vec2 disponibili.

        Returns:
            Dizionario con tutti i modelli Wav2Vec2.
        """
        return self._wav2vec2_models.copy()

    def get_all_whisper_models(self) -> Dict[str, Dict[str, Any]]:
        """
        Ottieni tutti i modelli Whisper disponibili.

        Returns:
            Dizionario con tutti i modelli Whisper (convertito da enum).
        """
        return {size.value: info for size, info in self._whisper_models.items()}

    def get_wav2vec2_model_name(self, model_key: Optional[str] = None) -> str:
        """
        Ottieni il nome Hugging Face di un modello Wav2Vec2.

        Args:
            model_key: Chiave del modello. Se None, usa quello attuale.

        Returns:
            Nome del modello per Hugging Face.

        Raises:
            KeyError: Se il modello non esiste.
        """
        return self.get_wav2vec2_model_info(model_key)["name"]

    def get_whisper_model_name(self, model_size: Optional[ModelSize] = None) -> str:
        """
        Ottieni il nome di un modello Whisper.

        Args:
            model_size: Dimensione del modello. Se None, usa quello attuale.

        Returns:
            Nome del modello Whisper.

        Raises:
            KeyError: Se il modello non esiste.
        """
        return self.get_whisper_model_info(model_size)["name"]