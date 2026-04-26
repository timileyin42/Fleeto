import uuid

from app.core.exceptions import AppException
from app.repositories.briefing_repo import BriefingRepository
from app.schemas.briefing import BriefingCreate, BriefingResponse
from app.services.formatter import BriefingFormatter


class BriefingService:
    def __init__(self, briefing_repo: BriefingRepository) -> None:
        self.briefing_repo = briefing_repo

    async def create_briefing(self, payload: BriefingCreate) -> BriefingResponse:
        briefing = await self.briefing_repo.create_briefing(
            company_name=payload.company_name,
            ticker=payload.ticker,
            summary=payload.summary,
            recommendation=payload.recommendation,
            key_points=payload.key_points,
            risks=payload.risks,
            metrics=[metric.model_dump() for metric in payload.metrics],
        )
        return BriefingResponse.model_validate(BriefingFormatter.to_response_payload(briefing))

    async def get_briefing(self, briefing_id: uuid.UUID) -> BriefingResponse:
        briefing = await self.briefing_repo.get_briefing(briefing_id)
        if not briefing:
            raise AppException(
                detail="Briefing not found",
                code="briefing_not_found",
                status_code=404,
            )
        return BriefingResponse.model_validate(BriefingFormatter.to_response_payload(briefing))
