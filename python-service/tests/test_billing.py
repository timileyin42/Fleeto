"""
tests/test_billing.py

Covers:
- test_initiate_subscription_returns_checkout_url
- test_webhook_upgrades_operator_plan
- test_webhook_rejects_invalid_signature
- test_get_billing_status_returns_plan
"""
from __future__ import annotations

import hashlib
import hmac
import json
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import Response as HttpxResponse

from app.core.exceptions import AppException
from app.core.security import hash_password
from app.models.enums import OperatorPlan
from app.models.operator import Operator
from app.repositories.operator_repo import OperatorRepository
from app.repositories.payment_repo import PaymentRepository
from app.schemas.billing import SubscribeRequest
from app.services.billing_service import BillingService


# ── helpers ──────────────────────────────────────────────────────────────────

async def _create_operator(session) -> Operator:
    operator = Operator(
        name="Tunde Logistics",
        email="tunde@test.com",
        hashed_password=hash_password("pass"),
    )
    session.add(operator)
    await session.commit()
    await session.refresh(operator)
    return operator


def _billing_service(db) -> BillingService:
    return BillingService(
        payment_repo=PaymentRepository(db),
        operator_repo=OperatorRepository(db),
    )


def _make_paystack_response(reference: str = "test_ref_123") -> MagicMock:
    mock_resp = MagicMock(spec=HttpxResponse)
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "status": True,
        "data": {
            "authorization_url": "https://checkout.paystack.com/abc123",
            "access_code": "abc123",
            "reference": reference,
        },
    }
    return mock_resp


def _sign_payload(payload_bytes: bytes, secret: str) -> str:
    return hmac.new(secret.encode(), payload_bytes, hashlib.sha512).hexdigest()


# ── tests ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_initiate_subscription_returns_checkout_url(db_session):
    operator = await _create_operator(db_session)
    service = _billing_service(db_session)

    mock_resp = _make_paystack_response("delivra_ref_001")

    with patch("app.services.billing_service.httpx.AsyncClient") as MockClient:
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_resp)
        MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        MockClient.return_value.__aexit__ = AsyncMock(return_value=False)

        result = await service.initialize_payment(OperatorPlan.growth, operator)

    assert result.checkout_url == "https://checkout.paystack.com/abc123"
    assert result.reference == "delivra_ref_001"

    payment = await PaymentRepository(db_session).get_by_reference("delivra_ref_001")
    assert payment is not None
    assert payment.status == "pending"
    assert payment.plan == OperatorPlan.growth
    assert payment.amount == 1_500_000


@pytest.mark.asyncio
async def test_subscribe_to_starter_raises_error(db_session):
    operator = await _create_operator(db_session)
    service = _billing_service(db_session)

    with pytest.raises(AppException) as exc_info:
        await service.initialize_payment(OperatorPlan.starter, operator)

    assert exc_info.value.status_code == 400
    assert exc_info.value.code == "invalid_plan"


@pytest.mark.asyncio
async def test_webhook_upgrades_operator_plan(db_session):
    operator = await _create_operator(db_session)
    service = _billing_service(db_session)

    payment = await PaymentRepository(db_session).create(
        operator_id=operator.id,
        reference="webhook_ref_001",
        plan=OperatorPlan.growth,
        amount=1_500_000,
    )
    assert payment.status == "pending"

    payload = {
        "event": "charge.success",
        "data": {"reference": "webhook_ref_001"},
    }
    await service.handle_webhook(payload)

    updated_payment = await PaymentRepository(db_session).get_by_reference("webhook_ref_001")
    assert updated_payment.status == "success"

    updated_operator = await OperatorRepository(db_session).get_by_id(operator.id)
    assert updated_operator.plan == OperatorPlan.growth


@pytest.mark.asyncio
async def test_webhook_ignores_non_charge_success_events(db_session):
    operator = await _create_operator(db_session)
    service = _billing_service(db_session)

    await PaymentRepository(db_session).create(
        operator_id=operator.id,
        reference="ref_refund",
        plan=OperatorPlan.growth,
        amount=1_500_000,
    )

    payload = {"event": "refund.processed", "data": {"reference": "ref_refund"}}
    await service.handle_webhook(payload)

    payment = await PaymentRepository(db_session).get_by_reference("ref_refund")
    assert payment.status == "pending"


@pytest.mark.asyncio
async def test_webhook_rejects_invalid_signature(db_session):
    operator = await _create_operator(db_session)
    service = _billing_service(db_session)

    payload_bytes = json.dumps({"event": "charge.success", "data": {"reference": "x"}}).encode()
    bad_sig = "deadbeef" * 16

    is_valid = service.verify_webhook_signature(payload_bytes, bad_sig)
    assert is_valid is False


@pytest.mark.asyncio
async def test_webhook_accepts_valid_signature(db_session):
    operator = await _create_operator(db_session)
    service = _billing_service(db_session)

    payload_bytes = b'{"event":"charge.success"}'

    from app.core.config import settings
    valid_sig = _sign_payload(payload_bytes, settings.paystack_secret_key)

    is_valid = service.verify_webhook_signature(payload_bytes, valid_sig)
    assert is_valid is True


@pytest.mark.asyncio
async def test_get_billing_status_returns_plan(db_session):
    operator = await _create_operator(db_session)
    service = _billing_service(db_session)

    await PaymentRepository(db_session).create(
        operator_id=operator.id,
        reference="status_ref_001",
        plan=OperatorPlan.growth,
        amount=1_500_000,
    )

    status = await service.get_status(operator)

    assert status.plan == OperatorPlan.starter
    assert len(status.payments) == 1
    assert status.payments[0].reference == "status_ref_001"
    assert status.payments[0].status == "pending"


@pytest.mark.asyncio
async def test_get_billing_status_empty_history(db_session):
    operator = await _create_operator(db_session)
    service = _billing_service(db_session)

    status = await service.get_status(operator)

    assert status.plan == OperatorPlan.starter
    assert status.payments == []
