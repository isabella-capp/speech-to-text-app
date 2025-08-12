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
        try:
            self._load_model()
            
            print(f"Processing {len(audio_bytes)} bytes of audio data")
            pcm, sr = decode_bytes_to_float32(audio_bytes)
            print(f"Decoded audio: {len(pcm)} samples at {sr}Hz")
            
            if sr != 16000:
                pcm = torchaudio.functional.resample(torch.tensor(pcm), sr, 16000).numpy()
                sr = 16000
                print(f"Resampled to 16kHz: {len(pcm)} samples")

            # Whisper richiede float32 numpy mono
            result = self.model.transcribe(pcm, fp16=False)
            text = result["text"].strip()
            print(f"Transcription completed: '{text}'")
            
            # Verifica che ci sia effettivamente del testo
            if not text:
                print("Warning: Whisper returned empty transcription")
                return "Nessun audio rilevato o audio non comprensibile."
                
            return text
        except Exception as e:
            print(f"Transcription error: {e}")
            raise Exception(f"Errore durante la trascrizione: {str(e)}")
