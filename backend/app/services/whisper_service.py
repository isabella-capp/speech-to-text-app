"""
Servizio Whisper per il riconoscimento vocale.

Implementa l'interfaccia ASRServiceInterface per fornire servizi di trascrizione
utilizzando modelli Whisper di OpenAI.
"""

import torch
import whisper
import torchaudio
import numpy as np
import time
from typing import Dict, Any, Optional

from app.interfaces.asr_interface import ASRServiceInterface
from app.utils.audio_utils import decode_bytes_to_float32
from app.models.model_manager import ASRModelManager, ModelSize
from app.utils.metrics import calculate_detailed_metrics


class WhisperService(ASRServiceInterface):
    """
    Servizio per trascrizione audio utilizzando modelli Whisper.
    
    Implementa l'interfaccia ASRServiceInterface e gestisce il caricamento
    dinamico dei modelli Whisper per la trascrizione multilingua.
    """

    def __init__(self):
        """Inizializza il servizio Whisper."""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
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
        model_name = self.model_manager.get_whisper_model_name()
        
        if self.model is None or force_reload or self._current_model_name != model_name:
            try:
                print(f"Loading Whisper model: {model_name}")
                self.model = whisper.load_model(model_name, device=self.device)
                self._current_model_name = model_name
                print("Whisper model loaded successfully!")
            except Exception as e:
                raise Exception(f"Errore nel caricamento del modello Whisper: {str(e)}")

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
            pcm = torchaudio.functional.resample(torch.tensor(pcm), original_sr, target_sr).numpy()
            print(f"Resampled from {original_sr}Hz to {target_sr}Hz: {len(pcm)} samples")
        return pcm

    async def transcribe(self, audio_bytes: bytes) -> str:
        """
        Trascrivi audio bytes in testo utilizzando Whisper.

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
            
            # Resample a 16kHz se necessario
            pcm = self._resample_audio(pcm, sr)

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
            
            # Resample a 16kHz se necessario
            pcm = self._resample_audio(pcm, sr)

            # Whisper richiede float32 numpy mono
            result = self.model.transcribe(pcm, fp16=False)
            text = result["text"].strip()
            
            # Fine misurazione tempo
            end_time = time.perf_counter()
            inference_time = end_time - start_time
            
            print(f"Transcription completed in {inference_time:.3f}s: '{text}'")
            
            # Verifica che ci sia effettivamente del testo
            if not text:
                print("Warning: Whisper returned empty transcription")
                text = "Nessun audio rilevato o audio non comprensibile."
            
            # Prepara la risposta
            response = {
                "text": text,
                "inference_time": inference_time,
                "model_info": self.get_model_info()
            }
            
            # Calcola metriche se fornito il testo di riferimento
            if reference_text:
                metrics = calculate_detailed_metrics(reference_text, text)
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
        return self.model_manager.get_whisper_model_info()

    async def update_model(self, model_name: str) -> bool:
        """
        Aggiorna il modello utilizzato dal servizio.

        Args:
            model_name: Nome del nuovo modello da utilizzare (tiny, base, small, medium, large).

        Returns:
            True se l'aggiornamento è riuscito.

        Raises:
            ValueError: Se il modello specificato non è supportato.
        """
        try:
            # Converti string in enum
            model_size = ModelSize(model_name.lower())
            self.model_manager.set_whisper_model(model_size)
            self._load_model(force_reload=True)
            return True
        except (ValueError, KeyError) as e:
            raise ValueError(f"Modello non supportato: {str(e)}")

    def get_supported_models(self) -> Dict[str, Dict[str, Any]]:
        """
        Ottieni la lista dei modelli supportati.

        Returns:
            Dizionario con i modelli supportati e le loro informazioni.
        """
        return self.model_manager.get_all_whisper_models()
