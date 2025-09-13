from pydantic import BaseModel
from typing import Optional, Dict, Any

class TranscriptionResponse(BaseModel):
    text: str
    inference_time: Optional[float] = None  # Tempo di inferenza in secondi
    metrics: Optional[Dict[str, Any]] = None  # Metriche WER, CER, ecc.
    model_info: Optional[Dict[str, Any]] = None  # Informazioni sul modello utilizzato

class TranscriptionWithReferenceRequest(BaseModel):
    """Richiesta di trascrizione con testo di riferimento per calcolo metriche."""
    reference_text: str  # Trascrizione di riferimento per calcolo WER/CER