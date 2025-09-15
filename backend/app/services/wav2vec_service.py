"""
Servizio Wav2Vec2 per il riconoscimento vocale.

Implementa l'interfaccia ASRServiceInterface per fornire servizi di trascrizione
utilizzando modelli Wav2Vec2 di Hugging Face.
"""

import torch
import torchaudio
import time
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import numpy as np
from typing import Dict, Any, Optional

from app.interfaces.asr_interface import ASRServiceInterface
from app.utils.audio_utils import decode_bytes_to_float32
from app.models.model_manager import ASRModelManager
from app.utils.metrics import calculate_detailed_metrics


class Wav2Vec2Service(ASRServiceInterface):
    """
    Servizio per trascrizione audio utilizzando modelli Wav2Vec2.
    
    Implementa l'interfaccia ASRServiceInterface e gestisce il caricamento
    dinamico dei modelli Wav2Vec2 per la trascrizione in italiano.
    """

    def __init__(self):
        """Inizializza il servizio Wav2Vec2."""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.processor = None
        self.model = None
        self.model_manager = ASRModelManager()
        self._current_model_name = None

    def _load_model(self, force_reload: bool = False) -> None:
        """
        Carica il modello solo quando necessario (lazy loading).

        Args:
            force_reload: Se True, forza il ricaricamento anche se già caricato.

        Raises:
            Exception: Se il caricamento del modello fallisce.
        """
        model_name = self.model_manager.get_wav2vec2_model_name()
        
        if self.model is None or force_reload or self._current_model_name != model_name:
            try:
                print(f"Loading Wav2Vec2 model: {model_name}")
                self.processor = Wav2Vec2Processor.from_pretrained(model_name)
                self.model = Wav2Vec2ForCTC.from_pretrained(model_name).to(self.device)
                self.model.eval()
                self._current_model_name = model_name
                print("Wav2Vec2 model loaded successfully!")
            except Exception as e:
                raise Exception(f"Errore nel caricamento del modello Wav2Vec2: {str(e)}")

    def _normalize_audio(self, pcm: np.ndarray) -> np.ndarray:
        """
        Normalizza l'array audio.

        Args:
            pcm: Array audio da normalizzare.

        Returns:
            Array audio normalizzato.
        """
        if len(pcm) > 0:
            max_val = np.max(np.abs(pcm))
            return pcm / max_val if max_val > 0 else pcm
        return pcm

    def _resample_audio(self, pcm: np.ndarray, original_sr: int, target_sr: int = 16000) -> np.ndarray:
        """
        Ricampiona l'audio alla frequenza target.

        Args:
            pcm: Array audio da ricampionare.
            original_sr: Frequenza di campionamento originale.
            target_sr: Frequenza di campionamento target.

        Returns:
            Array audio ricampionato.
        """
        if original_sr != target_sr:
            pcm_tensor = torch.tensor(pcm, dtype=torch.float32)
            pcm = torchaudio.functional.resample(pcm_tensor, original_sr, target_sr).numpy()
            print(f"Resampled from {original_sr}Hz to {target_sr}Hz: {len(pcm)} samples")
        return pcm

    def _postprocess_transcription(self, raw_transcription: str) -> str:
        """
        Post-processa la trascrizione per migliorare la qualità.

        Args:
            raw_transcription: Trascrizione grezza dal modello.

        Returns:
            Trascrizione post-processata.
        """
        result = raw_transcription.strip()
        
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
        
        return result

    async def transcribe(self, audio_bytes: bytes) -> str:
        """
        Trascrivi audio bytes in testo utilizzando Wav2Vec2.

        Args:
            audio_bytes: Array di bytes contenente l'audio da trascrivere.

        Returns:
            Stringa contenente la trascrizione dell'audio.

        Raises:
            Exception: Se si verifica un errore durante la trascrizione.
        """
        try:
            self._load_model()
            
            print(f"Processing {len(audio_bytes)} bytes of audio data")
            pcm, sr = decode_bytes_to_float32(audio_bytes)
            print(f"Decoded audio: {len(pcm)} samples at {sr}Hz")
            
            # Normalizza l'audio
            pcm = self._normalize_audio(pcm)
            
            # Resample a 16kHz se necessario
            pcm = self._resample_audio(pcm, sr)

            # Processa con il modello
            inputs = self.processor(
                pcm, 
                sampling_rate=16000, 
                return_tensors="pt", 
                padding=True,
                do_normalize=True
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                logits = self.model(**inputs).logits

            predicted_ids = torch.argmax(logits, dim=-1)
            transcription = self.processor.decode(predicted_ids[0])
            
            # Post-processing
            result = self._postprocess_transcription(transcription)
            
            print(f"Transcription completed: '{result}'")
            
            # Verifica che ci sia effettivamente del testo
            if not result or result.strip() == "":
                print("Warning: Wav2Vec2 returned empty transcription")
                return "Nessun audio rilevato o audio non comprensibile."
                
            return result
        except Exception as e:
            print(f"Transcription error: {e}")
            raise Exception(f"Errore durante la trascrizione: {str(e)}")

    async def transcribe_with_metrics(
        self, 
        audio_bytes: bytes, 
        reference_text: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Trascrivi audio bytes in testo e calcola metriche di valutazione.

        Args:
            audio_bytes: Array di bytes contenente l'audio da trascrivere.
            reference_text: Testo di riferimento per calcolo WER/CER (opzionale).

        Returns:
            Dizionario contenente:
            - text: Trascrizione dell'audio
            - inference_time: Tempo di inferenza in secondi
            - metrics: Metriche WER, CER se reference_text è fornito
            - model_info: Informazioni sul modello utilizzato

        Raises:
            Exception: Se si verifica un errore durante la trascrizione.
        """
        try:
            self._load_model()
            
            print(f"Processing {len(audio_bytes)} bytes of audio data")
            
            # Misura il tempo di inferenza
            start_time = time.perf_counter()
            
            pcm, sr = decode_bytes_to_float32(audio_bytes)
            print(f"Decoded audio: {len(pcm)} samples at {sr}Hz")
            
            # Normalizza l'audio
            pcm = self._normalize_audio(pcm)
            
            # Resample a 16kHz se necessario
            pcm = self._resample_audio(pcm, sr)

            # Processa con il modello
            inputs = self.processor(
                pcm, 
                sampling_rate=16000, 
                return_tensors="pt", 
                padding=True,
                do_normalize=True
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                logits = self.model(**inputs).logits

            predicted_ids = torch.argmax(logits, dim=-1)
            transcription = self.processor.decode(predicted_ids[0])
            
            # Post-processing
            result = self._postprocess_transcription(transcription)
            
            # Fine misurazione tempo
            end_time = time.perf_counter()
            inference_time = end_time - start_time
            
            print(f"Transcription completed in {inference_time:.3f}s: '{result}'")
            
            # Verifica che ci sia effettivamente del testo
            if not result or result.strip() == "":
                print("Warning: Wav2Vec2 returned empty transcription")
                result = "Nessun audio rilevato o audio non comprensibile."
            
            # Prepara la risposta
            response = {
                "text": result,
                "inference_time": inference_time,
                "model_info": self.get_model_info()
            }
            
            # Calcola metriche se fornito il testo di riferimento
            if reference_text:
                metrics = calculate_detailed_metrics(reference_text, result)
                response["metrics"] = metrics
                print(f"Metrics calculated - WER: {metrics['wer']:.3f}, CER: {metrics['cer']:.3f}")
            
            return response
            
        except Exception as e:
            print(f"Transcription error: {e}")
            raise Exception(f"Errore durante la trascrizione: {str(e)}")

    def get_model_info(self) -> Dict[str, Any]:
        """
        Ottieni informazioni sul modello attualmente in uso.

        Returns:
            Dizionario contenente informazioni sul modello.
        """
        return self.model_manager.get_wav2vec2_model_info()

    async def update_model(self, model_name: str) -> bool:
        """
        Aggiorna il modello utilizzato dal servizio.

        Args:
            model_name: Nome del nuovo modello da utilizzare.

        Returns:
            True se l'aggiornamento è riuscito.

        Raises:
            KeyError: Se il modello specificato non è supportato.
        """
        try:
            self.model_manager.set_wav2vec2_model(model_name)
            self._load_model(force_reload=True)
            return True
        except KeyError as e:
            raise ValueError(f"Modello non supportato: {str(e)}")

    def get_supported_models(self) -> Dict[str, Dict[str, Any]]:
        """
        Ottieni la lista dei modelli supportati.

        Returns:
            Dizionario con i modelli supportati e le loro informazioni.
        """
        return self.model_manager.get_all_wav2vec2_models()
