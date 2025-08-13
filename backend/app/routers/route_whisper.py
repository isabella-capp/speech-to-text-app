from fastapi import APIRouter, UploadFile, File
from app.services.whisper_service import WhisperService
from app.models import TranscriptionResponse

router = APIRouter()
whisper_service = WhisperService()

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    """Trascrivi un file audio usando Whisper"""
    print(f"Received file: {file.filename}, content_type: {file.content_type}, size: {file.size}")
    audio_bytes = await file.read()
    print(f"Read {len(audio_bytes)} bytes from file")
    
    text = await whisper_service.transcribe(audio_bytes)
    print(f"Service returned text: '{text}' (length: {len(text)})")
    
    response = TranscriptionResponse(text=text)
    print(f"Returning response: {response}")
    return response