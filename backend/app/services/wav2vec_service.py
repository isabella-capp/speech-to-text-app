# backend/app/services/wav2vec2_service.py
import torch
import torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import numpy as np
from app.utils.audio_utils import decode_bytes_to_float32
from app.config import settings

class Wav2Vec2Service:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.processor = None
        self.model = None

    def _load_model(self):
        """Carica il modello solo quando necessario (lazy loading)"""
        if self.model is None:
            print(f"Loading Wav2Vec2 model: {settings.wav2vec2_model}")
            self.processor = Wav2Vec2Processor.from_pretrained(settings.wav2vec2_model)
            self.model = Wav2Vec2ForCTC.from_pretrained(settings.wav2vec2_model).to(self.device)
            self.model.eval()
            print("Wav2Vec2 model loaded successfully!")

    async def transcribe(self, audio_bytes: bytes) -> str:
        try:
            self._load_model()
            
            print(f"Processing {len(audio_bytes)} bytes of audio data")
            pcm, sr = decode_bytes_to_float32(audio_bytes)
            print(f"Decoded audio: {len(pcm)} samples at {sr}Hz")
            
            # Normalizza l'audio
            if len(pcm) > 0:
                pcm = pcm / np.max(np.abs(pcm)) if np.max(np.abs(pcm)) > 0 else pcm
            
            # Resample a 16kHz se necessario
            if sr != 16000:
                pcm_tensor = torch.tensor(pcm, dtype=torch.float32)
                pcm = torchaudio.functional.resample(pcm_tensor, sr, 16000).numpy()
                sr = 16000
                print(f"Resampled to 16kHz: {len(pcm)} samples")

            # Processa con il modello
            inputs = self.processor(
                pcm, 
                sampling_rate=sr, 
                return_tensors="pt", 
                padding=True,
                do_normalize=True  # Normalizzazione aggiuntiva
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                logits = self.model(**inputs).logits

            predicted_ids = torch.argmax(logits, dim=-1)
            transcription = self.processor.decode(predicted_ids[0])
            
            # Post-processing migliorato per l'italiano
            result = transcription.strip()
            
            # Rimuovi token speciali se presenti
            result = result.replace("<s>", "").replace("</s>", "").replace("<pad>", "").replace("|", " ")
            
            # Rimuovi spazi multipli
            result = " ".join(result.split())
            
            # Capitalizza la prima lettera e dopo i punti
            if result:
                sentences = result.split('. ')
                sentences = [s.strip().capitalize() for s in sentences if s.strip()]
                result = '. '.join(sentences)
                if not result.endswith('.') and len(result) > 10:
                    result += '.'
            
            print(f"Transcription completed: '{result}'")
            
            # Verifica che ci sia effettivamente del testo
            if not result or result.strip() == "":
                print("Warning: Wav2Vec2 returned empty transcription")
                return "Nessun audio rilevato o audio non comprensibile."
                
            return result
        except Exception as e:
            print(f"Transcription error: {e}")
            raise Exception(f"Errore durante la trascrizione: {str(e)}")
