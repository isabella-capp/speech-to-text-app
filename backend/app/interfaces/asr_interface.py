"""
Interfacce astratte per i servizi ASR (Automatic Speech Recognition).

Questo modulo definisce il contratto che tutti i servizi ASR devono rispettare,
seguendo il principio di Dependency Inversion dei SOLID principles.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class ASRServiceInterface(ABC):
    """
    Interfaccia astratta per i servizi di riconoscimento vocale.
    
    Definisce il contratto che tutti i servizi ASR devono implementare,
    garantendo consistenza e intercambiabilità tra diversi provider.
    """

    @abstractmethod
    async def transcribe(self, audio_bytes: bytes) -> str:
        """
        Trascrivi audio bytes in testo.

        Args:
            audio_bytes: Array di bytes contenente l'audio da trascrivere.

        Returns:
            Stringa contenente la trascrizione dell'audio.

        Raises:
            Exception: Se si verifica un errore durante la trascrizione.
        """
        pass

    @abstractmethod
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
        pass

    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """
        Ottieni informazioni sul modello attualmente in uso.

        Returns:
            Dizionario contenente informazioni sul modello (nome, versione, ecc.).
        """
        pass

    @abstractmethod
    async def update_model(self, model_name: str) -> bool:
        """
        Aggiorna il modello utilizzato dal servizio.

        Args:
            model_name: Nome del nuovo modello da utilizzare.

        Returns:
            True se l'aggiornamento è riuscito, False altrimenti.

        Raises:
            ValueError: Se il modello specificato non è supportato.
        """
        pass

    @abstractmethod
    def get_supported_models(self) -> Dict[str, Dict[str, Any]]:
        """
        Ottieni la lista dei modelli supportati.

        Returns:
            Dizionario con i modelli supportati e le loro informazioni.
        """
        pass