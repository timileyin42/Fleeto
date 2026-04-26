import pytest

from app.repositories.operator_repo import OperatorRepository
from app.repositories.rider_repo import RiderRepository
from app.schemas.auth import OperatorRegister
from app.services.auth_service import AuthService
from app.core.exceptions import AppException


def _make_service(db):
    return AuthService(
        operator_repo=OperatorRepository(db),
        rider_repo=RiderRepository(db),
    )


@pytest.mark.asyncio
async def test_register_operator(db_session):
    service = _make_service(db_session)
    result = await service.register_operator(
        OperatorRegister(name="Ayo", email="ayo@test.com", password="secret123")
    )
    assert result.access_token
    assert result.token_type == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(db_session):
    service = _make_service(db_session)
    payload = OperatorRegister(name="Ayo", email="dup@test.com", password="secret123")
    await service.register_operator(payload)
    with pytest.raises(AppException) as exc_info:
        await service.register_operator(payload)
    assert exc_info.value.code == "email_taken"


@pytest.mark.asyncio
async def test_login_operator(db_session):
    service = _make_service(db_session)
    await service.register_operator(
        OperatorRegister(name="Ayo", email="ayo2@test.com", password="secret123")
    )
    result = await service.login_operator("ayo2@test.com", "secret123")
    assert result.access_token


@pytest.mark.asyncio
async def test_login_operator_wrong_password(db_session):
    service = _make_service(db_session)
    await service.register_operator(
        OperatorRegister(name="Ayo", email="ayo3@test.com", password="secret123")
    )
    with pytest.raises(AppException) as exc_info:
        await service.login_operator("ayo3@test.com", "wrongpassword")
    assert exc_info.value.code == "invalid_credentials"
