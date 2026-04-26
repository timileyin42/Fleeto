import uuid

from app.core.exceptions import AppException
from app.core.ws_manager import ws_manager
from app.models.enums import JobStatus
from app.models.rider import Rider
from app.repositories.job_repo import JobRepository
from app.repositories.location_repo import LocationRepository
from app.schemas.tracking import LocationSnapshot


class LocationService:
    def __init__(self, job_repo: JobRepository, location_repo: LocationRepository) -> None:
        self.job_repo = job_repo
        self.location_repo = location_repo

    async def record_ping(self, job_id: uuid.UUID, lat: float, lng: float, rider: Rider) -> LocationSnapshot:
        job = await self.job_repo.get_by_id(job_id)
        if not job or job.rider_id != rider.id:
            raise AppException(detail="Job not found", code="job_not_found", status_code=404)
        if job.status in (JobStatus.delivered, JobStatus.failed, JobStatus.created):
            raise AppException(
                detail="Location updates only allowed for active jobs",
                code="job_not_active",
                status_code=409,
            )

        ping = await self.location_repo.create(job_id=job.id, rider_id=rider.id, lat=lat, lng=lng)
        snapshot = LocationSnapshot(lat=ping.lat, lng=ping.lng, recorded_at=ping.recorded_at)

        await ws_manager.broadcast(str(job.id), {"lat": lat, "lng": lng, "recorded_at": ping.recorded_at.isoformat()})
        return snapshot
