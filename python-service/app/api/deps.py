from __future__ import annotations

import uuid

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.models.operator import Operator
from app.models.rider import Rider
from app.repositories.briefing_repo import BriefingRepository
from app.repositories.job_repo import JobRepository
from app.repositories.location_repo import LocationRepository
from app.repositories.operator_repo import OperatorRepository
from app.repositories.rider_repo import RiderRepository
from app.services.auth_service import AuthService
from app.services.briefing_service import BriefingService
from app.services.job_service import JobService
from app.services.location_service import LocationService
from app.services.report_service import ReportService
from app.services.rider_service import RiderService
from app.services.tracking_service import TrackingService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/operator/login", auto_error=False)


# ── Briefing (existing) ────────────────────────────────────────────────────────

async def get_briefing_service(db: AsyncSession = Depends(get_db)) -> BriefingService:
    return BriefingService(briefing_repo=BriefingRepository(db))


async def get_report_service(db: AsyncSession = Depends(get_db)) -> ReportService:
    return ReportService(briefing_repo=BriefingRepository(db))


# ── Auth helpers ───────────────────────────────────────────────────────────────

async def get_current_operator(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Operator:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        subject = decode_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not subject.startswith("operator:"):
        raise HTTPException(status_code=403, detail="Operator token required")

    operator_id = uuid.UUID(subject.split(":", 1)[1])
    operator = await OperatorRepository(db).get_by_id(operator_id)
    if not operator:
        raise HTTPException(status_code=401, detail="Operator not found")
    return operator


async def get_current_rider(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Rider:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        subject = decode_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not subject.startswith("rider:"):
        raise HTTPException(status_code=403, detail="Rider token required")

    rider_id = uuid.UUID(subject.split(":", 1)[1])
    rider = await RiderRepository(db).get_by_id(rider_id)
    if not rider:
        raise HTTPException(status_code=401, detail="Rider not found")
    return rider


# ── Delivra services ───────────────────────────────────────────────────────────

async def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(
        operator_repo=OperatorRepository(db),
        rider_repo=RiderRepository(db),
    )


async def get_rider_service(db: AsyncSession = Depends(get_db)) -> RiderService:
    return RiderService(rider_repo=RiderRepository(db))


async def get_job_service(db: AsyncSession = Depends(get_db)) -> JobService:
    return JobService(
        job_repo=JobRepository(db),
        rider_repo=RiderRepository(db),
    )


async def get_tracking_service(db: AsyncSession = Depends(get_db)) -> TrackingService:
    return TrackingService(
        job_repo=JobRepository(db),
        location_repo=LocationRepository(db),
        operator_repo=OperatorRepository(db),
        rider_repo=RiderRepository(db),
    )


async def get_location_service(db: AsyncSession = Depends(get_db)) -> LocationService:
    return LocationService(
        job_repo=JobRepository(db),
        location_repo=LocationRepository(db),
    )
