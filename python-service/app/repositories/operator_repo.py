from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.operator import Operator
from app.repositories.base import BaseRepository


class OperatorRepository(BaseRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def create(self, name: str, email: str, hashed_password: str) -> Operator:
        operator = Operator(name=name, email=email, hashed_password=hashed_password)
        self.session.add(operator)
        await self.session.commit()
        await self.session.refresh(operator)
        return operator

    async def create_google(self, firebase_uid: str, email: str, name: str) -> Operator:
        operator = Operator(firebase_uid=firebase_uid, email=email, name=name)
        self.session.add(operator)
        await self.session.commit()
        await self.session.refresh(operator)
        return operator

    async def get_by_id(self, operator_id: uuid.UUID) -> Optional[Operator]:
        result = await self.session.execute(select(Operator).where(Operator.id == operator_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[Operator]:
        result = await self.session.execute(select(Operator).where(Operator.email == email))
        return result.scalar_one_or_none()

    async def get_by_firebase_uid(self, firebase_uid: str) -> Optional[Operator]:
        result = await self.session.execute(
            select(Operator).where(Operator.firebase_uid == firebase_uid)
        )
        return result.scalar_one_or_none()

    async def update_name(self, operator: Operator, name: str) -> Operator:
        operator.name = name
        await self.session.commit()
        await self.session.refresh(operator)
        return operator

    async def link_firebase_uid(self, operator: Operator, firebase_uid: str) -> Operator:
        operator.firebase_uid = firebase_uid
        await self.session.commit()
        await self.session.refresh(operator)
        return operator
