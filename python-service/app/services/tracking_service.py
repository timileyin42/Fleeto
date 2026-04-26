from app.core.exceptions import AppException
from app.repositories.job_repo import JobRepository
from app.repositories.location_repo import LocationRepository
from app.repositories.operator_repo import OperatorRepository
from app.repositories.rider_repo import RiderRepository
from app.schemas.tracking import TrackingResponse


class TrackingService:
    def __init__(
        self,
        job_repo: JobRepository,
        location_repo: LocationRepository,
        operator_repo: OperatorRepository,
        rider_repo: RiderRepository,
    ) -> None:
        self.job_repo = job_repo
        self.location_repo = location_repo
        self.operator_repo = operator_repo
        self.rider_repo = rider_repo

    async def get_by_token(self, token: str) -> TrackingResponse:
        job = await self.job_repo.get_by_token(token)
        if not job:
            raise AppException(detail="Tracking link not found", code="not_found", status_code=404)

        latest_ping = await self.location_repo.get_latest_for_job(job.id)
        operator = await self.operator_repo.get_by_id(job.operator_id)
        rider = await self.rider_repo.get_by_id(job.rider_id) if job.rider_id else None

        return TrackingResponse(
            job_id=job.id,
            status=job.status,
            customer_name=job.customer_name,
            pickup_address=job.pickup_address,
            dropoff_address=job.dropoff_address,
            parcel_description=job.parcel_description,
            operator_name=operator.name if operator else "",
            rider_name=rider.name if rider else None,
            rider_phone=rider.phone if rider else None,
            last_lat=latest_ping.lat if latest_ping else None,
            last_lng=latest_ping.lng if latest_ping else None,
            last_seen=latest_ping.recorded_at if latest_ping else None,
        )
