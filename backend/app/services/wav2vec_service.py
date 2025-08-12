# backend/app/services/wav2vec2_service.py
import torch
import torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import numpy as np
from app.utils.audio_utils import decode_bytes_to_float32

class Wav2Vec2Service:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.processor = None
        self.model = None

    def _load_model(self):
        """Carica il modello solo quando necessario (lazy loading)"""
        if self.model is None:
            print("Loading Wav2Vec2 model...")
            self.processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-large-960h-lv60-self")
            self.model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-large-960h-lv60-self").to(self.device)
            self.model.eval()
            print("Wav2Vec2 model loaded successfully!")

    async def transcribe(self, audio_bytes: bytes) -> str:
        self._load_model()
        
        pcm, sr = decode_bytes_to_float32(audio_bytes)
        if sr != 16000:
            pcm = torchaudio.functional.resample(torch.tensor(pcm), sr, 16000).numpy()
            sr = 16000

        inputs = self.processor(pcm, sampling_rate=sr, return_tensors="pt", padding=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            logits = self.model(**inputs).logits

        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = self.processor.decode(predicted_ids[0])

        return transcription.lower()
