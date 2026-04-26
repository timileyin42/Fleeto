from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.location_ping import LocationPing
from app.repositories.base import BaseRepository


class LocationRepository(BaseRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def create(self, job_id: uuid.UUID, rider_id: uuid.UUID, lat: float, lng: float) -> LocationPing:
        ping = LocationPing(job_id=job_id, rider_id=rider_id, lat=lat, lng=lng)
        self.session.add(ping)
        await self.session.commit()
        await self.session.refresh(ping)
        return ping

    async def get_latest_for_job(self, job_id: uuid.UUID) -> Optional[LocationPing]:
        result = await self.session.execute(
            select(LocationPing)
            .where(LocationPing.job_id == job_id)
            .order_by(LocationPing.recorded_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
