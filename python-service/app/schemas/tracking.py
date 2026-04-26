from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.enums import JobStatus


class LocationSnapshot(BaseModel):
    lat: float
    lng: float
    recorded_at: datetime


class TrackingResponse(BaseModel):
    job_id: uuid.UUID
    status: JobStatus
    customer_name: Optional[str]
    pickup_address: str
    dropoff_address: str
    parcel_description: str
    operator_name: str
    rider_name: Optional[str]
    rider_phone: Optional[str]
    last_lat: Optional[float]
    last_lng: Optional[float]
    last_seen: Optional[datetime]
