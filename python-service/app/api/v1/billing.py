from __future__ import annotations

import json

from fastapi import APIRouter, Depends, Header, HTTPException, Request

from app.api.deps import get_current_operator
from app.models.operator import Operator
from app.schemas.billing import BillingStatusResponse, SubscribeRequest, SubscribeResponse
from app.services.billing_service import BillingService
from app.core.database import get_db
from app.repositories.payment_repo import PaymentRepository
from app.repositories.operator_repo import OperatorRepository
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/billing", tags=["billing"])


def _get_billing_service(db: AsyncSession = Depends(get_db)) -> BillingService:
    return BillingService(
        payment_repo=PaymentRepository(db),
        operator_repo=OperatorRepository(db),
    )


@router.post("/subscribe", response_model=SubscribeResponse)
async def subscribe(
    body: SubscribeRequest,
    operator: Operator = Depends(get_current_operator),
    service: BillingService = Depends(_get_billing_service),
):
    return await service.initialize_payment(body.plan, operator)


@router.post("/webhook", status_code=200)
async def paystack_webhook(
    request: Request,
    x_paystack_signature: str | None = Header(default=None),
    service: BillingService = Depends(_get_billing_service),
):
    body = await request.body()

    if not x_paystack_signature or not service.verify_webhook_signature(body, x_paystack_signature):
        raise HTTPException(status_code=400, detail="Invalid signature")

    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    await service.handle_webhook(payload)
    return {"status": "ok"}


@router.get("/status", response_model=BillingStatusResponse)
async def billing_status(
    operator: Operator = Depends(get_current_operator),
    service: BillingService = Depends(_get_billing_service),
):
    return await service.get_status(operator)
