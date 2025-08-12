from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.wav2vec_service import Wav2Vec2Service
import asyncio
import numpy as np
from app.utils.audio_utils import decode_bytes_to_float32

router = APIRouter()
service = Wav2Vec2Service()

@router.websocket("/ws")
async def websocket_wav2vec2(ws: WebSocket):
    await ws.accept()
    buffer = bytearray()
    try:
        while True:
            data = await ws.receive_bytes()
            buffer.extend(data)
            # Per semplicità, ogni 3 secondi trascrivo tutto il buffer
            if len(buffer) > 48000 * 2 * 3:  # 16kHz * 2 bytes * 3 sec
                pcm, sr = decode_bytes_to_float32(bytes(buffer))
                text = await service.transcribe(bytes(buffer))
                await ws.send_json({"type": "partial", "text": text})
                buffer.clear()
    except WebSocketDisconnect:
        # Alla disconnessione, trascrivo tutto quello che è rimasto
        if buffer:
            text = await service.transcribe(bytes(buffer))
            await ws.send_json({"type": "final", "text": text})