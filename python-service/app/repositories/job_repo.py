from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import Job
from app.models.enums import JobStatus
from app.repositories.base import BaseRepository


class JobRepository(BaseRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def create(
        self,
        operator_id: uuid.UUID,
        pickup_address: str,
        dropoff_address: str,
        parcel_description: str,
        rider_id: Optional[uuid.UUID],
        customer_phone: Optional[str],
        customer_name: Optional[str] = None,
    ) -> Job:
        status = JobStatus.assigned if rider_id else JobStatus.created
        job = Job(
            operator_id=operator_id,
            rider_id=rider_id,
            customer_name=customer_name,
            pickup_address=pickup_address,
            dropoff_address=dropoff_address,
            parcel_description=parcel_description,
            customer_phone=customer_phone,
            status=status,
        )
        self.session.add(job)
        await self.session.commit()
        await self.session.refresh(job)
        return job

    async def get_by_id(self, job_id: uuid.UUID) -> Optional[Job]:
        result = await self.session.execute(select(Job).where(Job.id == job_id))
        return result.scalar_one_or_none()

    async def get_by_token(self, token: str) -> Optional[Job]:
        result = await self.session.execute(select(Job).where(Job.tracking_token == token))
        return result.scalar_one_or_none()

    async def list_by_operator(self, operator_id: uuid.UUID) -> list:
        result = await self.session.execute(
            select(Job).where(Job.operator_id == operator_id).order_by(Job.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_by_rider(self, rider_id: uuid.UUID) -> list:
        result = await self.session.execute(
            select(Job).where(Job.rider_id == rider_id).order_by(Job.created_at.desc())
        )
        return list(result.scalars().all())

    async def update_status(self, job: Job, status: JobStatus) -> Job:
        job.status = status
        job.updated_at = datetime.now(timezone.utc)
        await self.session.commit()
        await self.session.refresh(job)
        return job

    async def assign_rider(self, job: Job, rider_id: uuid.UUID) -> Job:
        job.rider_id = rider_id
        job.status = JobStatus.assigned
        job.updated_at = datetime.now(timezone.utc)
        await self.session.commit()
        await self.session.refresh(job)
        return job
