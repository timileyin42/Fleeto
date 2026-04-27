import pytest

from app.repositories.operator_repo import OperatorRepository
from app.repositories.otp_repo import OtpRepository
from app.repositories.password_reset_repo import PasswordResetRepository
from app.repositories.rider_repo import RiderRepository
from app.schemas.auth import OperatorRegister
from app.services.auth_service import AuthService
from app.core.exceptions import AppException


def _make_service(db):
    return AuthService(
        operator_repo=OperatorRepository(db),
        rider_repo=RiderRepository(db),
        otp_repo=OtpRepository(db),
        password_reset_repo=PasswordResetRepository(db),
    )


async def _register_and_verify(service, otp_repo, name, email, password):
    """Helper: full sign-up flow → returns TokenResponse."""
    await service.register_operator(OperatorRegister(name=name, email=email, password=password))
    pending = await otp_repo.get_by_email(email)
    return await service.verify_otp(email, pending.code)


@pytest.mark.asyncio
async def test_register_sends_otp(db_session):
    service = _make_service(db_session)
    result = await service.register_operator(
        OperatorRegister(name="Ayo", email="ayo@test.com", password="secret123")
    )
    assert result.email == "ayo@test.com"
    assert "Verification" in result.message


@pytest.mark.asyncio
async def test_verify_otp_creates_account(db_session):
    service = _make_service(db_session)
    otp_repo = OtpRepository(db_session)
    result = await _register_and_verify(service, otp_repo, "Ayo", "ayo@test.com", "secret123")
    assert result.access_token
    assert result.token_type == "bearer"


@pytest.mark.asyncio
async def test_verify_otp_wrong_code(db_session):
    service = _make_service(db_session)
    await service.register_operator(
        OperatorRegister(name="Ayo", email="ayo@test.com", password="secret123")
    )
    with pytest.raises(AppException) as exc_info:
        await service.verify_otp("ayo@test.com", "000000")
    assert exc_info.value.code == "otp_invalid"


@pytest.mark.asyncio
async def test_register_duplicate_email(db_session):
    service = _make_service(db_session)
    otp_repo = OtpRepository(db_session)
    await _register_and_verify(service, otp_repo, "Ayo", "dup@test.com", "secret123")
    with pytest.raises(AppException) as exc_info:
        await service.register_operator(
            OperatorRegister(name="Ayo", email="dup@test.com", password="secret123")
        )
    assert exc_info.value.code == "email_taken"


@pytest.mark.asyncio
async def test_login_operator(db_session):
    service = _make_service(db_session)
    otp_repo = OtpRepository(db_session)
    await _register_and_verify(service, otp_repo, "Ayo", "ayo2@test.com", "secret123")
    result = await service.login_operator("ayo2@test.com", "secret123")
    assert result.access_token


@pytest.mark.asyncio
async def test_login_operator_wrong_password(db_session):
    service = _make_service(db_session)
    otp_repo = OtpRepository(db_session)
    await _register_and_verify(service, otp_repo, "Ayo", "ayo3@test.com", "secret123")
    with pytest.raises(AppException) as exc_info:
        await service.login_operator("ayo3@test.com", "wrongpassword")
    assert exc_info.value.code == "invalid_credentials"
