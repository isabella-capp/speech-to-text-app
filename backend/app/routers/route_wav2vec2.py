"""
Router per la trascrizione audio utilizzando modelli Wav2Vec2.

Fornisce endpoint per la trascrizione di file audio e per ottenere
informazioni sui formati supportati.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.wav2vec_service import Wav2Vec2Service
from app.models import TranscriptionResponse
from app.utils.audio_utils import get_supported_audio_formats

router = APIRouter()
wav2vec2_service = Wav2Vec2Service()


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Trascrivi un file audio utilizzando modelli Wav2Vec2.

    Args:
        file: File audio caricato dall'utente.

    Returns:
        Oggetto TranscriptionResponse contenente il testo trascritto.

    Raises:
        HTTPException: Se il file è vuoto o si verifica un errore durante la trascrizione.
    """
    print(f"Received file: {file.filename}, content_type: {file.content_type}, size: {file.size}")
    
    # Validazione del formato audio
    supported_formats = get_supported_audio_formats()
    if file.content_type and file.content_type not in supported_formats:
        print(f"Unsupported content type: {file.content_type}")
        print(f"Supported formats: {supported_formats}")
        # Non bloccare completamente, prova comunque (potrebbero esserci content-type sbagliati)
    
    audio_bytes = await file.read()
    print(f"Read {len(audio_bytes)} bytes from file")
    
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="File audio vuoto")
    
    try:
        text = await wav2vec2_service.transcribe(audio_bytes)
        print(f"Service returned text: '{text}' (length: {len(text)})")
        
        response = TranscriptionResponse(text=text)
        print(f"Returning response: {response}")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante la trascrizione: {str(e)}")


@router.get("/supported-formats")
async def get_supported_formats():
    """
    Ottieni i formati audio supportati per la trascrizione.

    Returns:
        Dizionario contenente la lista dei formati audio supportati.
    """
    return {"supported_formats": get_supported_audio_formats()}


@router.get("/model-info")
async def get_model_info():
    """
    Ottieni informazioni sul modello Wav2Vec2 attualmente utilizzato.

    Returns:
        Dizionario con le informazioni del modello attuale.
    """
    return wav2vec2_service.get_model_info()
