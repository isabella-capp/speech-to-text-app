from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.whisper_service import WhisperService
import asyncio
from app.utils.audio_utils import decode_bytes_to_float32

router = APIRouter()
service = WhisperService()

@router.websocket("/ws")
async def websocket_whisper(ws: WebSocket):
    await ws.accept()
    buffer = bytearray()
    try:
        while True:
            data = await ws.receive_bytes()
            buffer.extend(data)
            # Trascrizione ogni 5 secondi (adatta come vuoi)
            if len(buffer) > 16000 * 2 * 5:
                text = await service.transcribe(bytes(buffer))
                await ws.send_json({"type": "partial", "text": text})
                buffer.clear()
    except WebSocketDisconnect:
        if buffer:
            text = await service.transcribe(bytes(buffer))
            await ws.send_json({"type": "final", "text": text})
