from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_operator, get_db
from app.models.job import Job as JobModel
from app.models.operator import Operator
from app.repositories.operator_repo import OperatorRepository
from app.schemas.notifications import NotificationCount, NotificationPrefs, NotificationPrefsUpdate

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/count", response_model=NotificationCount)
async def get_notification_count(
    current_operator: Operator = Depends(get_current_operator),
    db: AsyncSession = Depends(get_db),
) -> NotificationCount:
    count = await db.scalar(
        select(func.count(JobModel.id)).where(
            JobModel.operator_id == current_operator.id,
            JobModel.status == "pending",
        )
    ) or 0
    return NotificationCount(count=count)

_DEFAULTS: dict = {"new_jobs": True, "status_updates": True, "payments": False}


def _coerce(raw: object) -> dict:
    if isinstance(raw, dict):
        return raw
    return _DEFAULTS.copy()


@router.get("/prefs", response_model=NotificationPrefs)
async def get_notification_prefs(
    current_operator: Operator = Depends(get_current_operator),
) -> NotificationPrefs:
    prefs = _coerce(current_operator.notification_prefs)
    return NotificationPrefs(
        new_jobs=bool(prefs.get("new_jobs", True)),
        status_updates=bool(prefs.get("status_updates", True)),
        payments=bool(prefs.get("payments", False)),
    )


@router.patch("/prefs", response_model=NotificationPrefs)
async def update_notification_prefs(
    payload: NotificationPrefsUpdate,
    current_operator: Operator = Depends(get_current_operator),
    db: AsyncSession = Depends(get_db),
) -> NotificationPrefs:
    repo = OperatorRepository(db)
    updated = await repo.update_notification_prefs(current_operator, payload.model_dump())
    prefs = _coerce(updated.notification_prefs)
    return NotificationPrefs(
        new_jobs=bool(prefs.get("new_jobs", True)),
        status_updates=bool(prefs.get("status_updates", True)),
        payments=bool(prefs.get("payments", False)),
    )
