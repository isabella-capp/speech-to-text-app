# backend/app/services/whisper_service.py
import torch
import whisper
import torchaudio
from app.utils.audio_utils import decode_bytes_to_float32
import numpy as np

class WhisperService:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None

    def _load_model(self):
        """Carica il modello solo quando necessario (lazy loading)"""
        if self.model is None:
            print("Loading Whisper model...")
            self.model = whisper.load_model("small", device=self.device)
            print("Whisper model loaded successfully!")

    async def transcribe(self, audio_bytes: bytes) -> str:
        self._load_model()
        
        pcm, sr = decode_bytes_to_float32(audio_bytes)
        if sr != 16000:
            pcm = torchaudio.functional.resample(torch.tensor(pcm), sr, 16000).numpy()
            sr = 16000

        # Whisper richiede float32 numpy mono
        result = self.model.transcribe(pcm, fp16=False)
        return result["text"].strip()
