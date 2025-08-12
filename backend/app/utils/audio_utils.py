# backend/app/utils/audio_utils.py
import io
import numpy as np
import soundfile as sf

def decode_bytes_to_float32(audio_bytes: bytes):
    try:
        bio = io.BytesIO(audio_bytes)
        data, sr = sf.read(bio, dtype="float32")
        if data.ndim > 1:
            data = data.mean(axis=1)  # stereo to mono
        return data, sr
    except Exception:
        # Assume raw PCM16 LE mono 16kHz
        arr = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        sr = 16000
        return arr, sr
