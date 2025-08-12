# app/services/wav2vec_service.py
import base64
import numpy as np
import torch
import torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from app.utils.audio_utils import decode_audio_base64

class Wav2VecService:
    def __init__(self, model_name="facebook/wav2vec2-large-960h-lv60-self", device=None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[Wav2Vec2] Loading model on {self.device}...")
        self.processor = Wav2Vec2Processor.from_pretrained(model_name)
        self.model = Wav2Vec2ForCTC.from_pretrained(model_name).to(self.device)
        self.model.eval()

    async def transcribe(self, audio_b64: str):
        # Decodifica base64 → numpy PCM float32
        pcm, sr = decode_audio_base64(audio_b64)

        # Se necessario, resample a 16kHz
        if sr != 16000:
            pcm_tensor = torch.tensor(pcm, dtype=torch.float32)
            pcm_tensor = torchaudio.transforms.Resample(sr, 16000)(pcm_tensor)
            pcm = pcm_tensor.numpy()
            sr = 16000

        # Prepara input per modello
        inputs = self.processor(pcm, sampling_rate=sr, return_tensors="pt", padding=True)
        with torch.no_grad():
            logits = self.model(inputs.input_values.to(self.device)).logits
        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = self.processor.decode(predicted_ids[0])

        return transcription
