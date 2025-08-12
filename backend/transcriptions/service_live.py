# transcriptions/service_live.py
class TranscriptionLiveService:
    def __init__(self):
        self.model = None

    async def load_model(self, model_name: str):
        if model_name == "whisper":
            from whisper_streaming import Transcriber
            self.model = Transcriber(model_size="small", device="cuda")
            self.model.start()
        elif model_name == "wav2vec2":
            from wav2vec2_live import Wav2Vec2Live
            self.model = Wav2Vec2Live("facebook/wav2vec2-base-960h")
        else:
            raise ValueError("Unsupported model")

    async def transcribe_chunk(self, chunk: bytes):
        if hasattr(self.model, "feed_audio"):  # Whisper
            self.model.feed_audio(chunk)
            return self.model.get_transcription()
        elif hasattr(self.model, "accept_waveform"):  # Wav2Vec2
            self.model.accept_waveform(chunk)
            return self.model.get_transcription()

    async def close(self):
        self.model = None
