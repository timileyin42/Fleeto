from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.models.enums import OperatorPlan


class SubscribeRequest(BaseModel):
    plan: OperatorPlan


class SubscribeResponse(BaseModel):
    checkout_url: str
    reference: str


class PaymentRecord(BaseModel):
    id: uuid.UUID
    reference: str
    plan: OperatorPlan
    amount: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class BillingStatusResponse(BaseModel):
    plan: OperatorPlan
    payments: List[PaymentRecord]
