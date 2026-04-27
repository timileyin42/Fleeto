from __future__ import annotations

import uuid
from typing import Optional, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import Payment
from app.repositories.base import BaseRepository


class PaymentRepository(BaseRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def create(
        self,
        operator_id: uuid.UUID,
        reference: str,
        plan: str,
        amount: int,
    ) -> Payment:
        payment = Payment(
            operator_id=operator_id,
            reference=reference,
            plan=plan,
            amount=amount,
            status="pending",
        )
        self.session.add(payment)
        await self.session.commit()
        await self.session.refresh(payment)
        return payment

    async def get_by_reference(self, reference: str) -> Optional[Payment]:
        result = await self.session.execute(
            select(Payment).where(Payment.reference == reference)
        )
        return result.scalar_one_or_none()

    async def mark_success(self, payment: Payment) -> Payment:
        payment.status = "success"
        await self.session.commit()
        await self.session.refresh(payment)
        return payment

    async def mark_failed(self, payment: Payment) -> Payment:
        payment.status = "failed"
        await self.session.commit()
        await self.session.refresh(payment)
        return payment

    async def list_for_operator(self, operator_id: uuid.UUID) -> List[Payment]:
        result = await self.session.execute(
            select(Payment)
            .where(Payment.operator_id == operator_id)
            .order_by(Payment.created_at.desc())
        )
        return list(result.scalars().all())
