import asyncio
import uuid

from app.core.config import settings
from app.core.exceptions import AppException
from app.core.security import hash_password
from app.models.operator import Operator
from app.repositories.rider_repo import RiderRepository
from app.schemas.rider import RiderCreate, RiderResponse
from app.services.email_service import send_rider_credentials_email


class RiderService:
    def __init__(self, rider_repo: RiderRepository) -> None:
        self.rider_repo = rider_repo

    async def add_rider(self, payload: RiderCreate, operator: Operator) -> RiderResponse:
        rider = await self.rider_repo.create(
            operator_id=operator.id,
            name=payload.name,
            phone=payload.phone,
            hashed_password=hash_password(payload.password),
            email=payload.email,
        )

        if payload.email:
            login_url = f"{settings.app_base_url}/rider/login"
            asyncio.create_task(
                asyncio.to_thread(
                    send_rider_credentials_email,
                    rider_email=payload.email,
                    rider_name=payload.name,
                    operator_name=operator.name,
                    phone=payload.phone,
                    password=payload.password,
                    login_url=login_url,
                )
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
