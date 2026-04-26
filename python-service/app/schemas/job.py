from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.enums import JobStatus


class JobCreate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    pickup_address: str
    dropoff_address: str
    parcel_description: str = ""
    rider_id: Optional[uuid.UUID] = None


class JobAssign(BaseModel):
    rider_id: uuid.UUID


class JobStatusUpdate(BaseModel):
    status: JobStatus


class JobResponse(BaseModel):
    id: uuid.UUID
    operator_id: uuid.UUID
    rider_id: Optional[uuid.UUID]
    customer_name: Optional[str]
    customer_phone: Optional[str]
    pickup_address: str
    dropoff_address: str
    parcel_description: str
    status: JobStatus
    tracking_token: str
    item_photo_url: Optional[str]
    proof_photo_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
