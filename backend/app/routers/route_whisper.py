from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.whisper_service import WhisperService
from app.models import TranscriptionResponse
from app.utils.audio_utils import get_supported_audio_formats

router = APIRouter()
whisper_service = WhisperService()

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    """Trascrivi un file audio usando Whisper"""
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
    
    text = await whisper_service.transcribe(audio_bytes)
    print(f"Service returned text: '{text}' (length: {len(text)})")
    
    response = TranscriptionResponse(text=text)
    print(f"Returning response: {response}")
    return response

@router.get("/supported-formats")
async def get_supported_formats():
    """Restituisce i formati audio supportati"""
    return {"supported_formats": get_supported_audio_formats()}