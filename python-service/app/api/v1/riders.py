import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_operator, get_current_rider, get_db
from app.models.operator import Operator
from app.models.rider import Rider
from app.models.job import Job as JobModel
from app.schemas.rider import RiderCreate, RiderResponse, RiderStats
from app.services.rider_service import RiderService
from app.api.deps import get_rider_service

router = APIRouter(prefix="/riders", tags=["riders"])


@router.get("/me/stats", response_model=RiderStats)
async def get_my_stats(
    rider: Rider = Depends(get_current_rider),
    db: AsyncSession = Depends(get_db),
) -> RiderStats:
    delivered = await db.scalar(
        select(func.count(JobModel.id)).where(
            JobModel.rider_id == rider.id,
            JobModel.status == "delivered",
        )
    ) or 0
    failed = await db.scalar(
        select(func.count(JobModel.id)).where(
            JobModel.rider_id == rider.id,
            JobModel.status == "failed",
        )
    ) or 0
    total = delivered + failed
    rate = round(delivered / total * 100, 1) if total > 0 else 0.0
    return RiderStats(total_jobs=delivered, completion_rate=rate)


@router.post("", response_model=RiderResponse, status_code=status.HTTP_201_CREATED)
async def add_rider(
    payload: RiderCreate,
    operator: Operator = Depends(get_current_operator),
    service: RiderService = Depends(get_rider_service),
) -> RiderResponse:
    return await service.add_rider(payload, operator)


@router.get("", response_model=list[RiderResponse])
async def list_riders(
    operator: Operator = Depends(get_current_operator),
    service: RiderService = Depends(get_rider_service),
) -> list[RiderResponse]:
    return await service.list_riders(operator)


@router.get("/{rider_id}", response_model=RiderResponse)
async def get_rider(
    rider_id: uuid.UUID,
    operator: Operator = Depends(get_current_operator),
    service: RiderService = Depends(get_rider_service),
) -> RiderResponse:
    return await service.get_rider(rider_id, operator)
