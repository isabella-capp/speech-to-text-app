# backend/app/utils/audio_utils.py
import io
import numpy as np
import soundfile as sf

def decode_bytes_to_float32(audio_bytes: bytes):
    try:
        # Prova prima con soundfile per file audio standard (WAV, MP3, etc.)
        bio = io.BytesIO(audio_bytes)
        data, sr = sf.read(bio, dtype="float32")
        if data.ndim > 1:
            data = data.mean(axis=1)  # stereo to mono
        return data, sr
    except Exception as e:
        print(f"Soundfile decode failed: {e}, trying raw PCM...")
        # Fallback: assume raw PCM16 LE mono 16kHz
        try:
            # Assicurati che la dimensione del buffer sia un multiplo di 2 (per int16)
            if len(audio_bytes) % 2 != 0:
                print(f"Buffer size {len(audio_bytes)} not multiple of 2, truncating")
                audio_bytes = audio_bytes[:-1]  # Rimuovi l'ultimo byte
            
            arr = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            sr = 16000
            return arr, sr
        except Exception as e2:
            print(f"Raw PCM decode also failed: {e2}")
            raise Exception(f"Cannot decode audio data: soundfile error: {e}, raw PCM error: {e2}")
