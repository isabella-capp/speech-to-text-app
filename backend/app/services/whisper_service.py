# app/services/whisper_service.py
import base64
import numpy as np
import torch
import torchaudio
import whisper
from app.utils.audio_utils import decode_audio_base64

class WhisperService:
    def __init__(self, model_name="small", device=None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[Whisper] Loading model '{model_name}' on {self.device}...")
        self.model = whisper.load_model(model_name, device=self.device)

    async def transcribe(self, audio_b64: str):
        pcm, sr = decode_audio_base64(audio_b64)

        # Resample a 16kHz mono
        if sr != 16000:
            pcm_tensor = torch.tensor(pcm, dtype=torch.float32)
            pcm_tensor = torchaudio.transforms.Resample(sr, 16000)(pcm_tensor)
            pcm = pcm_tensor.numpy()
            sr = 16000

        # Whisper accetta numpy float32
        result = self.model.transcribe(pcm, fp16=False)
        return result["text"]
