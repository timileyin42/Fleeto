from __future__ import annotations

import asyncio
import secrets
from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.core.exceptions import AppException
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.operator_repo import OperatorRepository
from app.repositories.otp_repo import OtpRepository
from app.repositories.password_reset_repo import PasswordResetRepository
from app.repositories.rider_repo import RiderRepository
from app.schemas.auth import OperatorRegister, OtpSentResponse, TokenResponse
from app.services.email_service import send_otp_email, send_password_reset_email, send_welcome_email

_OTP_TTL_MINUTES = 10


class AuthService:
    def __init__(
        self,
        operator_repo: OperatorRepository,
        rider_repo: RiderRepository,
        otp_repo: OtpRepository,
        password_reset_repo: PasswordResetRepository,
    ) -> None:
        self.operator_repo = operator_repo
        self.rider_repo = rider_repo
        self.otp_repo = otp_repo
        self.password_reset_repo = password_reset_repo

    async def register_operator(self, payload: OperatorRegister) -> OtpSentResponse:
        existing = await self.operator_repo.get_by_email(payload.email)
        if existing:
            raise AppException(detail="Email already registered", code="email_taken", status_code=409)

        code = f"{secrets.randbelow(1_000_000):06d}"
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=_OTP_TTL_MINUTES)

        await self.otp_repo.upsert(
            email=payload.email,
            name=payload.name,
            hashed_password=hash_password(payload.password),
            code=code,
            expires_at=expires_at,
        )
        await self.otp_repo.session.commit()

        asyncio.create_task(
            asyncio.to_thread(
                send_otp_email,
                operator_email=payload.email,
                operator_name=payload.name,
                code=code,
            )
        )

        return OtpSentResponse(
            message="Verification code sent to your email",
            email=payload.email,
        )

    async def verify_otp(self, email: str, code: str) -> TokenResponse:
        pending = await self.otp_repo.get_by_email(email)
        if not pending:
            raise AppException(
                detail="No verification in progress for this email",
                code="otp_not_found",
                status_code=404,
            )

        if datetime.now(timezone.utc) > pending.expires_at.replace(tzinfo=timezone.utc):
            await self.otp_repo.delete(pending)
            await self.otp_repo.session.commit()
            raise AppException(
                detail="Verification code expired — please sign up again",
                code="otp_expired",
                status_code=400,
            )

        if pending.code != code.strip():
            raise AppException(
                detail="Invalid verification code",
                code="otp_invalid",
                status_code=400,
            )

        operator = await self.operator_repo.create(
            name=pending.name,
            email=pending.email,
            hashed_password=pending.hashed_password,
        )
        await self.otp_repo.delete(pending)
        await self.otp_repo.session.commit()

        dashboard_url = f"{settings.app_base_url}/dashboard"
        asyncio.create_task(
            asyncio.to_thread(
                send_welcome_email,
                operator_name=operator.name,
                operator_email=operator.email,
                dashboard_url=dashboard_url,
            )
        )

        token = create_access_token(f"operator:{operator.id}")
        return TokenResponse(access_token=token)

    async def resend_otp(self, email: str) -> OtpSentResponse:
        pending = await self.otp_repo.get_by_email(email)
        if not pending:
            raise AppException(
                detail="No pending signup for this email",
                code="otp_not_found",
                status_code=404,
            )

        code = f"{secrets.randbelow(1_000_000):06d}"
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=_OTP_TTL_MINUTES)
        pending.code = code
        pending.expires_at = expires_at
        await self.otp_repo.session.commit()

        asyncio.create_task(
            asyncio.to_thread(
                send_otp_email,
                operator_email=pending.email,
                operator_name=pending.name,
                code=code,
            )
        )

        return OtpSentResponse(
            message="Verification code resent",
            email=email,
        )

    async def forgot_password(self, email: str) -> OtpSentResponse:
        operator = await self.operator_repo.get_by_email(email)
        if not operator:
            # Don't leak whether the email exists — return success regardless
            return OtpSentResponse(message="If that email is registered, a reset code has been sent", email=email)

        code = f"{secrets.randbelow(1_000_000):06d}"
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=_OTP_TTL_MINUTES)
        await self.password_reset_repo.upsert(email=email, code=code, expires_at=expires_at)
        await self.password_reset_repo.session.commit()

        asyncio.create_task(
            asyncio.to_thread(
                send_password_reset_email,
                operator_email=email,
                operator_name=operator.name,
                code=code,
            )
        )
        return OtpSentResponse(message="If that email is registered, a reset code has been sent", email=email)

    async def reset_password(self, email: str, code: str, new_password: str) -> None:
        record = await self.password_reset_repo.get_by_email(email)
        if not record:
            raise AppException(detail="No password reset in progress for this email", code="reset_not_found", status_code=404)

        if datetime.now(timezone.utc) > record.expires_at.replace(tzinfo=timezone.utc):
            await self.password_reset_repo.delete(record)
            await self.password_reset_repo.session.commit()
            raise AppException(detail="Reset code expired — please request a new one", code="reset_expired", status_code=400)

        if record.code != code.strip():
            raise AppException(detail="Invalid reset code", code="reset_invalid", status_code=400)

        operator = await self.operator_repo.get_by_email(email)
        if not operator:
            raise AppException(detail="Account not found", code="not_found", status_code=404)

        await self.operator_repo.update_password(operator, hash_password(new_password))
        await self.password_reset_repo.delete(record)
        await self.password_reset_repo.session.commit()

    async def login_operator(self, email: str, password: str) -> TokenResponse:
        operator = await self.operator_repo.get_by_email(email)
        if not operator or not operator.hashed_password:
            raise AppException(detail="Invalid credentials", code="invalid_credentials", status_code=401)
        if not verify_password(password, operator.hashed_password):
            raise AppException(detail="Invalid credentials", code="invalid_credentials", status_code=401)
        token = create_access_token(f"operator:{operator.id}")
        return TokenResponse(access_token=token)

    async def login_rider(self, phone: str, password: str) -> TokenResponse:
        rider = await self.rider_repo.get_by_phone(phone)
        if not rider or not rider.hashed_password:
            raise AppException(detail="Invalid credentials", code="invalid_credentials", status_code=401)
        if not verify_password(password, rider.hashed_password):
            raise AppException(detail="Invalid credentials", code="invalid_credentials", status_code=401)
        token = create_access_token(f"rider:{rider.id}")
        return TokenResponse(access_token=token)

    async def google_signin(self, firebase_uid: str, email: str, name: str) -> TokenResponse:
        operator = await self.operator_repo.get_by_firebase_uid(firebase_uid)

        if not operator:
            operator = await self.operator_repo.get_by_email(email)

        if not operator:
            operator = await self.operator_repo.create_google(
                firebase_uid=firebase_uid,
                email=email,
                name=name,
            )
            dashboard_url = f"{settings.app_base_url}/dashboard"
            asyncio.create_task(
                asyncio.to_thread(
                    send_welcome_email,
                    operator_name=operator.name,
                    operator_email=operator.email,
                    dashboard_url=dashboard_url,
                )
            )
        elif not operator.firebase_uid:
            await self.operator_repo.link_firebase_uid(operator, firebase_uid)

        token = create_access_token(f"operator:{operator.id}")
        return TokenResponse(access_token=token)
