from fastapi import APIRouter, UploadFile, File
from app.services.wav2vec_service import Wav2Vec2Service
from app.models import TranscriptionResponse

router = APIRouter()
wav2vec2_service = Wav2Vec2Service()

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    """Trascrivi un file audio usando Wav2Vec2"""
    print(f"Received file: {file.filename}, content_type: {file.content_type}, size: {file.size}")
    audio_bytes = await file.read()
    print(f"Read {len(audio_bytes)} bytes from file")
    
    text = await wav2vec2_service.transcribe(audio_bytes)
    print(f"Service returned text: '{text}' (length: {len(text)})")
    
    response = TranscriptionResponse(text=text)
    print(f"Returning response: {response}")
    return response
