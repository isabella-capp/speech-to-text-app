from app.services.wav2vec_service import Wav2VecService
from app.services.whisper_service import WhisperService

class ASRService:
    def __init__(self):
        self.wav2vec = Wav2VecService()
        self.whisper = WhisperService()

    async def process_audio(self, audio_data: str, model: str):
        if model == "wav2vec":
            return await self.wav2vec.transcribe(audio_data)
        elif model == "whisper":
            return await self.whisper.transcribe(audio_data)
        return "Unknown model"
