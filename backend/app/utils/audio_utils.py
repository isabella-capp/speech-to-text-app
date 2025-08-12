# app/utils/audio_utils.py
import base64
import tempfile
import soundfile as sf
import numpy as np

def decode_audio_base64(b64_data: str):
    """
    Decodifica una stringa base64 (WAV PCM16) in numpy array float32 e ritorna (pcm, sample_rate).
    """
    raw = base64.b64decode(b64_data)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(raw)
        tmp.flush()
        pcm, sr = sf.read(tmp.name, dtype="float32")
    return pcm, sr
