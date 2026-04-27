from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.password_reset import PasswordReset


class PasswordResetRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def upsert(self, email: str, code: str, expires_at: datetime) -> PasswordReset:
        existing = await self.get_by_email(email)
        if existing:
            existing.code = code
            existing.expires_at = expires_at
            await self.session.flush()
            return existing

        record = PasswordReset(id=uuid.uuid4(), email=email, code=code, expires_at=expires_at)
        self.session.add(record)
        await self.session.flush()
        return record

    async def get_by_email(self, email: str) -> PasswordReset | None:
        result = await self.session.execute(
            select(PasswordReset).where(PasswordReset.email == email)
        )
        return result.scalar_one_or_none()

    async def delete(self, record: PasswordReset) -> None:
        await self.session.delete(record)
        await self.session.flush()
