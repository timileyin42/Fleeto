import uuid

from fastapi import APIRouter, Depends, status

from app.api.deps import get_current_operator, get_current_rider, get_job_service, get_location_service
from app.models.operator import Operator
from app.models.rider import Rider
from app.schemas.job import JobAssign, JobCreate, JobResponse, JobStatusUpdate
from app.schemas.tracking import LocationSnapshot
from app.services.job_service import JobService
from app.services.location_service import LocationService

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    payload: JobCreate,
    operator: Operator = Depends(get_current_operator),
    service: JobService = Depends(get_job_service),
) -> JobResponse:
    return await service.create_job(payload, operator)


@router.get("", response_model=list[JobResponse])
async def list_jobs(
    operator: Operator = Depends(get_current_operator),
    service: JobService = Depends(get_job_service),
) -> list[JobResponse]:
    return await service.list_operator_jobs(operator)


@router.get("/mine", response_model=list[JobResponse])
async def list_my_jobs(
    rider: Rider = Depends(get_current_rider),
    service: JobService = Depends(get_job_service),
) -> list[JobResponse]:
    return await service.list_rider_jobs(rider)


@router.get("/mine/{job_id}", response_model=JobResponse)
async def get_rider_job(
    job_id: uuid.UUID,
    rider: Rider = Depends(get_current_rider),
    service: JobService = Depends(get_job_service),
) -> JobResponse:
    return await service.get_rider_job(job_id, rider)


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: uuid.UUID,
    operator: Operator = Depends(get_current_operator),
    service: JobService = Depends(get_job_service),
) -> JobResponse:
    return await service.get_job(job_id, operator)


@router.patch("/{job_id}/assign", response_model=JobResponse)
async def assign_rider(
    job_id: uuid.UUID,
    payload: JobAssign,
    operator: Operator = Depends(get_current_operator),
    service: JobService = Depends(get_job_service),
) -> JobResponse:
    return await service.assign_rider(job_id, payload.rider_id, operator)


@router.patch("/{job_id}/status", response_model=JobResponse)
async def update_status(
    job_id: uuid.UUID,
    payload: JobStatusUpdate,
    rider: Rider = Depends(get_current_rider),
    service: JobService = Depends(get_job_service),
) -> JobResponse:
    return await service.update_job_status(job_id, payload.status, rider)


@router.post("/{job_id}/location", response_model=LocationSnapshot)
async def ping_location(
    job_id: uuid.UUID,
    lat: float,
    lng: float,
    rider: Rider = Depends(get_current_rider),
    service: LocationService = Depends(get_location_service),
) -> LocationSnapshot:
    return await service.record_ping(job_id, lat, lng, rider)
