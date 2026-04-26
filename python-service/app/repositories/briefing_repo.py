import uuid
from decimal import Decimal
from typing import Optional, Union

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.briefing import Briefing
from app.models.briefing_metric import BriefingMetric
from app.models.briefing_point import BriefingPoint
from app.models.briefing_risk import BriefingRisk
from app.repositories.base import BaseRepository


class BriefingRepository(BaseRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def create_briefing(
        self,
        *,
        company_name: str,
        ticker: str,
        summary: str,
        recommendation: str,
        key_points: list[str],
        risks: list[str],
        metrics: list[dict[str, Union[Decimal, str, None]]],
    ) -> Briefing:
        briefing = Briefing(
            company_name=company_name,
            ticker=ticker,
            summary=summary,
            recommendation=recommendation,
        )
        self.session.add(briefing)
        await self.session.flush()

        for index, point in enumerate(key_points):
            self.session.add(BriefingPoint(briefing_id=briefing.id, point_text=point, position=index))

        for index, risk in enumerate(risks):
            self.session.add(BriefingRisk(briefing_id=briefing.id, risk_text=risk, position=index))

        for metric in metrics:
            self.session.add(
                BriefingMetric(
                    briefing_id=briefing.id,
                    name=str(metric["name"]),
                    value=Decimal(str(metric["value"])),
                    unit=str(metric["unit"]) if metric.get("unit") else None,
                ),
            )

        await self.session.commit()
        return await self.get_briefing(briefing.id)

    async def get_briefing(self, briefing_id: uuid.UUID) -> Optional[Briefing]:
        stmt = (
            select(Briefing)
            .where(Briefing.id == briefing_id)
            .options(
                selectinload(Briefing.points),
                selectinload(Briefing.risks),
                selectinload(Briefing.metrics),
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
