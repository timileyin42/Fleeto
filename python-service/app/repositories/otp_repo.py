from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.otp_code import OtpCode


class OtpRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def upsert(
        self,
        email: str,
        name: str,
        hashed_password: str,
        code: str,
        expires_at: datetime,
    ) -> OtpCode:
        existing = await self.get_by_email(email)
        if existing:
            existing.name = name
            existing.hashed_password = hashed_password
            existing.code = code
            existing.expires_at = expires_at
            await self.session.flush()
            return existing

        otp = OtpCode(
            id=uuid.uuid4(),
            email=email,
            name=name,
            hashed_password=hashed_password,
            code=code,
            expires_at=expires_at,
        )
        self.session.add(otp)
        await self.session.flush()
        return otp

    async def get_by_email(self, email: str) -> OtpCode | None:
        result = await self.session.execute(
            select(OtpCode).where(OtpCode.email == email)
        )
        return result.scalar_one_or_none()

    async def delete(self, otp: OtpCode) -> None:
        await self.session.delete(otp)
        await self.session.flush()
