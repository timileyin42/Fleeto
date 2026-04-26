import uuid

from fastapi import APIRouter, Depends, status
from fastapi.responses import HTMLResponse

from app.api.deps import get_briefing_service, get_report_service
from app.schemas.briefing import BriefingCreate, BriefingResponse
from app.services.briefing_service import BriefingService
from app.services.report_service import ReportService

router = APIRouter(prefix="/briefings", tags=["briefings"])


@router.post("", response_model=BriefingResponse, status_code=status.HTTP_201_CREATED)
async def create_briefing(
    payload: BriefingCreate,
    service: BriefingService = Depends(get_briefing_service),
) -> BriefingResponse:
    return await service.create_briefing(payload)


@router.get("/{briefing_id}", response_model=BriefingResponse)
async def get_briefing(
    briefing_id: uuid.UUID,
    service: BriefingService = Depends(get_briefing_service),
) -> BriefingResponse:
    return await service.get_briefing(briefing_id)


@router.get("/{briefing_id}/report", response_class=HTMLResponse)
async def get_briefing_report(
    briefing_id: uuid.UUID,
    report_service: ReportService = Depends(get_report_service),
) -> HTMLResponse:
    html = await report_service.render_html_report(briefing_id)
    return HTMLResponse(content=html)
