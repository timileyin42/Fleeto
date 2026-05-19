from __future__ import annotations

import asyncio
import hashlib
import hmac
import uuid

import httpx

from app.core.config import settings
from app.core.exceptions import AppException
from app.models.enums import OperatorPlan
from app.models.operator import Operator
from app.repositories.operator_repo import OperatorRepository
from app.repositories.payment_repo import PaymentRepository
from app.repositories.rider_repo import RiderRepository
from app.schemas.billing import BillingStatusResponse, PaymentRecord, SubscribeResponse
from app.services.email_service import send_payment_success_email

_PLAN_AMOUNTS: dict[OperatorPlan, int] = {
    OperatorPlan.growth: 1_500_000,   # ₦15,000 in kobo
    OperatorPlan.business: 5_000_000, # ₦50,000 in kobo
}

_PAYSTACK_INIT_URL = "https://api.paystack.co/transaction/initialize"
_PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify"


class BillingService:
    def __init__(
        self,
        payment_repo: PaymentRepository,
        operator_repo: OperatorRepository,
        rider_repo: RiderRepository,
    ) -> None:
        self.payment_repo = payment_repo
        self.operator_repo = operator_repo
        self.rider_repo = rider_repo

    async def initialize_payment(
        self, plan: OperatorPlan, operator: Operator
    ) -> SubscribeResponse:
        if plan == OperatorPlan.starter:
            raise AppException(
                detail="Cannot subscribe to the free Starter plan via billing",
                code="invalid_plan",
                status_code=400,
            )

        amount = _PLAN_AMOUNTS[plan]
        callback_url = f"{settings.app_base_url}/dashboard/billing?status=success"

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                _PAYSTACK_INIT_URL,
                json={
                    "email": operator.email,
                    "amount": amount,
                    "callback_url": callback_url,
                    "metadata": {
                        "operator_id": str(operator.id),
                        "plan": plan.value,
                    },
                },
                headers={
                    "Authorization": f"Bearer {settings.paystack_secret_key}",
                    "Content-Type": "application/json",
                },
                timeout=15,
            )

        if resp.status_code != 200:
            raise AppException(
                detail="Failed to initialize payment with Paystack",
                code="paystack_error",
                status_code=502,
            )

        data = resp.json()["data"]
        reference = data["reference"]
        checkout_url = data["authorization_url"]

        await self.payment_repo.create(
            operator_id=operator.id,
            reference=reference,
            plan=plan,
            amount=amount,
        )

        return SubscribeResponse(checkout_url=checkout_url, reference=reference)

    def verify_webhook_signature(self, payload_bytes: bytes, signature: str) -> bool:
        expected = hmac.new(
            settings.paystack_secret_key.encode(),
            payload_bytes,
            hashlib.sha512,
        ).hexdigest()
        return hmac.compare_digest(expected, signature)

    async def handle_webhook(self, payload: dict) -> None:
        event = payload.get("event")
        if event != "charge.success":
            return

        data = payload.get("data", {})
        reference = data.get("reference")
        if not reference:
            return

        payment = await self.payment_repo.get_by_reference(reference)
        if not payment or payment.status == "success":
            return

        await self.payment_repo.mark_success(payment)

        operator = await self.operator_repo.get_by_id(payment.operator_id)
        if operator:
            operator.plan = payment.plan
            await self.operator_repo.session.commit()

            plan_name = payment.plan.value.capitalize()
            amount_str = f"₦{payment.amount // 100:,}"
            dashboard_url = f"{settings.app_base_url}/dashboard/billing"
            asyncio.create_task(
                asyncio.to_thread(
                    send_payment_success_email,
                    operator_email=operator.email,
                    operator_name=operator.name,
                    plan_name=plan_name,
                    amount=amount_str,
                    reference=payment.reference,
                    dashboard_url=dashboard_url,
                )
            )

    async def get_status(self, operator: Operator) -> BillingStatusResponse:
        payments, riders = await asyncio.gather(
            self.payment_repo.list_for_operator(operator.id),
            self.rider_repo.list_by_operator(operator.id),
        )
        active_riders = sum(1 for r in riders if r.status != "offline")
        return BillingStatusResponse(
            plan=operator.plan,
            active_riders=active_riders,
            payments=[PaymentRecord.model_validate(p) for p in payments],
        )
