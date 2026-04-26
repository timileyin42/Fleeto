from __future__ import annotations

import uuid
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.rider import Rider
from app.repositories.base import BaseRepository


class RiderRepository(BaseRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def create(self, operator_id: uuid.UUID, name: str, phone: str, hashed_password: str) -> Rider:
        rider = Rider(operator_id=operator_id, name=name, phone=phone, hashed_password=hashed_password)
        self.session.add(rider)
        await self.session.commit()
        await self.session.refresh(rider)
        return rider

    async def get_by_id(self, rider_id: uuid.UUID) -> Optional[Rider]:
        result = await self.session.execute(select(Rider).where(Rider.id == rider_id))
        return result.scalar_one_or_none()

    async def get_by_phone(self, phone: str) -> Optional[Rider]:
        result = await self.session.execute(select(Rider).where(Rider.phone == phone))
        return result.scalar_one_or_none()

    async def list_by_operator(self, operator_id: uuid.UUID) -> List[Rider]:
        result = await self.session.execute(
            select(Rider).where(Rider.operator_id == operator_id).order_by(Rider.created_at)
        )
        return list(result.scalars().all())

    async def update_status(self, rider: Rider, status: str) -> Rider:
        rider.status = status  # type: ignore[assignment]
        await self.session.commit()
        await self.session.refresh(rider)
        return rider
