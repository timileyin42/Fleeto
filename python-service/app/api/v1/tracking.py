from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from app.api.deps import get_tracking_service
from app.core.ws_manager import ws_manager
from app.schemas.tracking import TrackingResponse
from app.services.tracking_service import TrackingService

router = APIRouter(prefix="/tracking", tags=["tracking"])


@router.get("/{token}", response_model=TrackingResponse)
async def get_tracking(
    token: str,
    service: TrackingService = Depends(get_tracking_service),
) -> TrackingResponse:
    return await service.get_by_token(token)


@router.websocket("/{job_id}/ws")
async def location_stream(job_id: str, ws: WebSocket) -> None:
    await ws_manager.connect(job_id, ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(job_id, ws)
