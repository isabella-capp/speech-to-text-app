# transcriptions/ws_controller.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from .service_live import TranscriptionLiveService

router = APIRouter()

@router.websocket("/ws/transcribe")
async def websocket_transcribe(websocket: WebSocket, model: str = "whisper"):
    service = TranscriptionLiveService()
    await websocket.accept()
    await service.load_model(model)

    try:
        async for chunk in websocket.iter_bytes():
            text = await service.transcribe_chunk(chunk)
            if text:
                await websocket.send_json({"partial_text": text})
    except WebSocketDisconnect:
        await service.close()
