from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.enums import RiderStatus


class RiderCreate(BaseModel):
    name: str
    phone: str
    password: str
    email: Optional[str] = None


class RiderResponse(BaseModel):
    id: uuid.UUID
    operator_id: uuid.UUID
    name: str
    email: Optional[str]
    phone: str
    status: RiderStatus
    profile_picture_url: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class RiderStatusUpdate(BaseModel):
    status: RiderStatus


class RiderStats(BaseModel):
    total_jobs: int
    completion_rate: float
