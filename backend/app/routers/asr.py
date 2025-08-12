from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.services.asr_service import ASRService

router = APIRouter()

asr_service = ASRService()

@router.websocket("/ws/asr")
async def websocket_asr(ws: WebSocket, model: str = Query("wav2vec")):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            text = await asr_service.process_audio(data, model)
            await ws.send_text(text)
    except WebSocketDisconnect:
        print("Client disconnected")
