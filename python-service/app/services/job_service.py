from __future__ import annotations

import asyncio
import uuid

from app.core.exceptions import AppException
from app.models.enums import JobStatus
from app.models.operator import Operator
from app.models.rider import Rider
from app.repositories.job_repo import JobRepository
from app.repositories.rider_repo import RiderRepository
from app.schemas.job import JobCreate, JobResponse
from app.services.whatsapp_service import send_tracking_link

_RIDER_TRANSITIONS: dict[JobStatus, set[JobStatus]] = {
    JobStatus.assigned: {JobStatus.picked_up},
    JobStatus.picked_up: {JobStatus.in_transit},
    JobStatus.in_transit: {JobStatus.delivered, JobStatus.failed},
}


class JobService:
    def __init__(self, job_repo: JobRepository, rider_repo: RiderRepository) -> None:
        self.job_repo = job_repo
        self.rider_repo = rider_repo

    async def create_job(self, payload: JobCreate, operator: Operator) -> JobResponse:
        if payload.rider_id:
            rider = await self.rider_repo.get_by_id(payload.rider_id)
            if not rider or rider.operator_id != operator.id:
                raise AppException(detail="Rider not found in fleet", code="rider_not_found", status_code=404)

        job = await self.job_repo.create(
            operator_id=operator.id,
            customer_name=payload.customer_name,
            pickup_address=payload.pickup_address,
            dropoff_address=payload.dropoff_address,
            parcel_description=payload.parcel_description,
            rider_id=payload.rider_id,
            customer_phone=payload.customer_phone,
        )

        # Send WhatsApp tracking link — fire-and-forget, never blocks the response
        if job.customer_phone:
            asyncio.create_task(
                send_tracking_link(
                    customer_phone=job.customer_phone,
                    tracking_token=job.tracking_token,
                    operator_name=operator.name,
                )
            )

        return JobResponse.model_validate(job)

    async def list_operator_jobs(self, operator: Operator) -> list[JobResponse]:
        jobs = await self.job_repo.list_by_operator(operator.id)
        return [JobResponse.model_validate(j) for j in jobs]

    async def get_job(self, job_id: uuid.UUID, operator: Operator) -> JobResponse:
        job = await self.job_repo.get_by_id(job_id)
        if not job or job.operator_id != operator.id:
            raise AppException(detail="Job not found", code="job_not_found", status_code=404)
        return JobResponse.model_validate(job)

    async def assign_rider(self, job_id: uuid.UUID, rider_id: uuid.UUID, operator: Operator) -> JobResponse:
        job = await self.job_repo.get_by_id(job_id)
        if not job or job.operator_id != operator.id:
            raise AppException(detail="Job not found", code="job_not_found", status_code=404)
        if job.status not in (JobStatus.created, JobStatus.assigned):
            raise AppException(detail="Job cannot be reassigned at this stage", code="invalid_transition", status_code=409)

        rider = await self.rider_repo.get_by_id(rider_id)
        if not rider or rider.operator_id != operator.id:
            raise AppException(detail="Rider not found in fleet", code="rider_not_found", status_code=404)

        updated = await self.job_repo.assign_rider(job, rider_id)
        return JobResponse.model_validate(updated)

    async def update_job_status(self, job_id: uuid.UUID, new_status: JobStatus, rider: Rider) -> JobResponse:
        job = await self.job_repo.get_by_id(job_id)
        if not job or job.rider_id != rider.id:
            raise AppException(detail="Job not found", code="job_not_found", status_code=404)

        allowed = _RIDER_TRANSITIONS.get(job.status, set())
        if new_status not in allowed:
            raise AppException(
                detail=f"Cannot transition from {job.status} to {new_status}",
                code="invalid_transition",
                status_code=409,
            )

        updated = await self.job_repo.update_status(job, new_status)
        return JobResponse.model_validate(updated)

    async def get_rider_job(self, job_id: uuid.UUID, rider: Rider) -> JobResponse:
        job = await self.job_repo.get_by_id(job_id)
        if not job or job.rider_id != rider.id:
            raise AppException(detail="Job not found", code="job_not_found", status_code=404)
        return JobResponse.model_validate(job)

    async def list_rider_jobs(self, rider: Rider) -> list[JobResponse]:
        jobs = await self.job_repo.list_by_rider(rider.id)
        return [JobResponse.model_validate(j) for j in jobs]
