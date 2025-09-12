"""
Utilities per il processamento e la conversione di file audio.

Questo modulo fornisce funzioni per la decodifica, conversione e gestione
di file audio in vari formati, utilizzando librerie come soundfile e FFmpeg.
"""

import io
import numpy as np
import soundfile as sf
import ffmpeg
import tempfile
import os
from typing import Tuple, Optional


def detect_audio_format(audio_bytes: bytes) -> Optional[str]:
    """
    Rileva il formato audio analizzando i magic bytes.

    Args:
        audio_bytes: Array di bytes contenente l'audio.

    Returns:
        Stringa con il formato rilevato (wav, mp3, ogg, etc.) o None se non riconosciuto.
    """
    if len(audio_bytes) < 12:
        return None
    
    # Magic bytes per diversi formati
    if audio_bytes.startswith(b'RIFF') and b'WAVE' in audio_bytes[:12]:
        return 'wav'
    elif audio_bytes.startswith(b'ID3') or audio_bytes.startswith(b'\xff\xfb') or audio_bytes.startswith(b'\xff\xf3') or audio_bytes.startswith(b'\xff\xf2'):
        return 'mp3'
    elif audio_bytes.startswith(b'OggS'):
        return 'ogg'
    elif audio_bytes.startswith(b'\x1a\x45\xdf\xa3'):  # WebM/Matroska header
        return 'webm'
    elif b'ftyp' in audio_bytes[:12]:  # MP4/M4A container
        return 'mp4'
    elif audio_bytes.startswith(b'fLaC'):
        return 'flac'
    
    return None


def convert_audio_with_ffmpeg(audio_bytes: bytes, input_format: Optional[str] = None) -> Tuple[np.ndarray, int]:
    """
    Converte audio usando FFmpeg e restituisce array numpy float32 mono a 16kHz.

    Args:
        audio_bytes: Array di bytes contenente l'audio da convertire.
        input_format: Formato dell'audio di input (opzionale).

    Returns:
        Tupla contenente (array_audio, sample_rate).

    Raises:
        Exception: Se la conversione FFmpeg fallisce.
    """
    # Crea file temporanei
    with tempfile.NamedTemporaryFile(suffix=f'.{input_format}' if input_format else '', delete=False) as input_file:
        input_file.write(audio_bytes)
        input_path = input_file.name
    
    output_path = None
    try:
        # Crea file temporaneo per l'output
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as output_file:
            output_path = output_file.name
        
        # Converte usando FFmpeg a WAV mono 16kHz
        stream = ffmpeg.input(input_path)
        stream = ffmpeg.output(
            stream, 
            output_path,
            acodec='pcm_s16le',  # PCM 16-bit little endian
            ac=1,                # mono
            ar=16000,            # 16kHz sample rate
            f='wav'              # WAV format
        )
        
        # Esegui la conversione
        ffmpeg.run(stream, capture_stdout=True, capture_stderr=True, overwrite_output=True, quiet=True)
        
        # Leggi il file convertito
        with open(output_path, 'rb') as f:
            converted_bytes = f.read()
        
        # Decodifica con soundfile
        bio = io.BytesIO(converted_bytes)
        data, sr = sf.read(bio, dtype="float32")
        
        # Assicurati che sia mono
        if data.ndim > 1:
            data = data.mean(axis=1)
        
        return data, sr
        
    except Exception as e:
        raise Exception(f"Errore durante la conversione FFmpeg: {str(e)}")
    finally:
        # Pulisci i file temporanei
        try:
            os.unlink(input_path)
            if output_path and os.path.exists(output_path):
                os.unlink(output_path)
        except:
            pass

def decode_bytes_to_float32(audio_bytes: bytes) -> Tuple[np.ndarray, int]:
    """
    Decodifica bytes audio in array numpy float32 mono.

    Supporta vari formati attraverso multiple strategie di decodifica:
    1. Soundfile per formati standard
    2. FFmpeg per formati complessi
    3. Raw PCM come fallback

    Args:
        audio_bytes: Array di bytes contenente l'audio da decodificare.

    Returns:
        Tupla contenente (array_audio, sample_rate).

    Raises:
        Exception: Se tutti i metodi di decodifica falliscono.
    """
    try:
        # Prova prima con soundfile per file audio standard (WAV, MP3, etc.)
        bio = io.BytesIO(audio_bytes)
        data, sr = sf.read(bio, dtype="float32")
        if data.ndim > 1:
            data = data.mean(axis=1)  # stereo to mono
        print(f"Soundfile decode successful: {len(data)} samples at {sr}Hz")
        return data, sr
    except Exception as e:
        print(f"Soundfile decode failed: {e}, trying FFmpeg conversion...")
        
        # Rileva il formato audio
        detected_format = detect_audio_format(audio_bytes)
        print(f"Detected audio format: {detected_format}")
        
        try:
            # Prova con FFmpeg per convertire il formato
            data, sr = convert_audio_with_ffmpeg(audio_bytes, detected_format)
            print(f"FFmpeg conversion successful: {len(data)} samples at {sr}Hz")
            return data, sr
        except Exception as e2:
            print(f"FFmpeg conversion failed: {e2}, trying raw PCM...")
            
            # Fallback: assume raw PCM16 LE mono 16kHz
            try:
                # Assicurati che la dimensione del buffer sia un multiplo di 2 (per int16)
                if len(audio_bytes) % 2 != 0:
                    print(f"Buffer size {len(audio_bytes)} not multiple of 2, truncating")
                    audio_bytes = audio_bytes[:-1]  # Rimuovi l'ultimo byte
                
                arr = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
                sr = 16000
                print(f"Raw PCM decode successful: {len(arr)} samples at {sr}Hz")
                return arr, sr
            except Exception as e3:
                print(f"Raw PCM decode also failed: {e3}")
                raise Exception(f"Cannot decode audio data: soundfile error: {e}, FFmpeg error: {e2}, raw PCM error: {e3}")


def get_supported_audio_formats() -> list[str]:
    """
    Ottieni la lista dei formati audio supportati.

    Returns:
        Lista di stringhe con i MIME types dei formati audio supportati.
    """
    return [
        'audio/wav', 'audio/wave', 'audio/x-wav',
        'audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/m4a',
        'audio/webm', 'audio/ogg', 'audio/flac',
        'audio/aac', 'audio/3gpp', 'audio/amr'
    ]