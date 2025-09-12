"""
Router per la gestione dei modelli ASR.

Fornisce endpoint per visualizzare, cambiare e gestire i modelli
Wav2Vec2 e Whisper utilizzati dall'applicazione.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from app.services.wav2vec_service import Wav2Vec2Service
from app.services.whisper_service import WhisperService
from app.models.model_manager import ASRModelManager

router = APIRouter()
model_manager = ASRModelManager()
wav2vec2_service = Wav2Vec2Service()
whisper_service = WhisperService()


class ModelUpdateRequest(BaseModel):
    """Schema per la richiesta di aggiornamento modello."""
    model_name: str


class ModelResponse(BaseModel):
    """Schema per la risposta di informazioni modello."""
    current_model: str
    model_info: Dict[str, Any]
    available_models: Dict[str, Dict[str, Any]]


@router.get("/wav2vec2/current", response_model=ModelResponse)
async def get_current_wav2vec2_model():
    """
    Ottieni informazioni sul modello Wav2Vec2 attualmente attivo.

    Returns:
        Informazioni complete sul modello attuale e modelli disponibili.

    Raises:
        HTTPException: Se si verifica un errore nel recupero delle informazioni.
    """
    try:
        current_model = model_manager.get_current_wav2vec2_model()
        model_info = model_manager.get_wav2vec2_model_info()
        available_models = model_manager.get_all_wav2vec2_models()
        
        return ModelResponse(
            current_model=current_model,
            model_info=model_info,
            available_models=available_models
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nel recupero del modello: {str(e)}")


@router.post("/wav2vec2/update")
async def update_wav2vec2_model(request: ModelUpdateRequest):
    """
    Aggiorna il modello Wav2Vec2 di default.

    Args:
        request: Richiesta contenente il nome del nuovo modello.

    Returns:
        Messaggio di conferma con informazioni sul nuovo modello.

    Raises:
        HTTPException: Se il modello non è supportato o si verifica un errore.
    """
    try:
        success = await wav2vec2_service.update_model(request.model_name)
        if success:
            new_model_info = model_manager.get_wav2vec2_model_info()
            return {
                "message": f"Modello Wav2Vec2 aggiornato con successo",
                "new_model": request.model_name,
                "model_info": new_model_info
            }
        else:
            raise HTTPException(status_code=400, detail="Aggiornamento del modello fallito")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nell'aggiornamento del modello: {str(e)}")


@router.get("/whisper/current", response_model=ModelResponse)
async def get_current_whisper_model():
    """
    Ottieni informazioni sul modello Whisper attualmente attivo.

    Returns:
        Informazioni complete sul modello attuale e modelli disponibili.

    Raises:
        HTTPException: Se si verifica un errore nel recupero delle informazioni.
    """
    try:
        current_model = model_manager.get_current_whisper_model().value
        model_info = model_manager.get_whisper_model_info()
        available_models = model_manager.get_all_whisper_models()
        
        return ModelResponse(
            current_model=current_model,
            model_info=model_info,
            available_models=available_models
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nel recupero del modello: {str(e)}")


@router.post("/whisper/update")
async def update_whisper_model(request: ModelUpdateRequest):
    """
    Aggiorna il modello Whisper di default.

    Args:
        request: Richiesta contenente il nome del nuovo modello (tiny, base, small, medium, large).

    Returns:
        Messaggio di conferma con informazioni sul nuovo modello.

    Raises:
        HTTPException: Se il modello non è supportato o si verifica un errore.
    """
    try:
        success = await whisper_service.update_model(request.model_name)
        if success:
            new_model_info = model_manager.get_whisper_model_info()
            return {
                "message": f"Modello Whisper aggiornato con successo",
                "new_model": request.model_name,
                "model_info": new_model_info
            }
        else:
            raise HTTPException(status_code=400, detail="Aggiornamento del modello fallito")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nell'aggiornamento del modello: {str(e)}")


@router.get("/status")
async def get_models_status():
    """
    Ottieni lo stato di tutti i modelli ASR.

    Returns:
        Stato completo di tutti i modelli Wav2Vec2 e Whisper.

    Raises:
        HTTPException: Se si verifica un errore nel recupero dello stato.
    """
    try:
        return {
            "wav2vec2": {
                "current_model": model_manager.get_current_wav2vec2_model(),
                "model_info": model_manager.get_wav2vec2_model_info(),
                "available_models": model_manager.get_all_wav2vec2_models()
            },
            "whisper": {
                "current_model": model_manager.get_current_whisper_model().value,
                "model_info": model_manager.get_whisper_model_info(),
                "available_models": model_manager.get_all_whisper_models()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nel recupero dello stato: {str(e)}")