import uuid

from fastapi import APIRouter, Depends, status

from app.api.deps import get_current_operator, get_rider_service
from app.models.operator import Operator
from app.schemas.rider import RiderCreate, RiderResponse
from app.services.rider_service import RiderService

router = APIRouter(prefix="/riders", tags=["riders"])


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
