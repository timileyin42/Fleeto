import uuid

from app.core.exceptions import AppException
from app.core.security import hash_password
from app.models.operator import Operator
from app.repositories.rider_repo import RiderRepository
from app.schemas.rider import RiderCreate, RiderResponse


class RiderService:
    def __init__(self, rider_repo: RiderRepository) -> None:
        self.rider_repo = rider_repo

    async def add_rider(self, payload: RiderCreate, operator: Operator) -> RiderResponse:
        rider = await self.rider_repo.create(
            operator_id=operator.id,
            name=payload.name,
            phone=payload.phone,
            hashed_password=hash_password(payload.password),
        )
        return RiderResponse.model_validate(rider)

    async def list_riders(self, operator: Operator) -> list[RiderResponse]:
        riders = await self.rider_repo.list_by_operator(operator.id)
        return [RiderResponse.model_validate(r) for r in riders]

    async def get_rider(self, rider_id: uuid.UUID, operator: Operator) -> RiderResponse:
        rider = await self.rider_repo.get_by_id(rider_id)
        if not rider or rider.operator_id != operator.id:
            raise AppException(detail="Rider not found", code="rider_not_found", status_code=404)
        return RiderResponse.model_validate(rider)
