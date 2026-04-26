from __future__ import annotations

from app.core.exceptions import AppException
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.operator_repo import OperatorRepository
from app.repositories.rider_repo import RiderRepository
from app.schemas.auth import OperatorRegister, TokenResponse


class AuthService:
    def __init__(self, operator_repo: OperatorRepository, rider_repo: RiderRepository) -> None:
        self.operator_repo = operator_repo
        self.rider_repo = rider_repo

    async def register_operator(self, payload: OperatorRegister) -> TokenResponse:
        existing = await self.operator_repo.get_by_email(payload.email)
        if existing:
            raise AppException(detail="Email already registered", code="email_taken", status_code=409)
        operator = await self.operator_repo.create(
            name=payload.name,
            email=payload.email,
            hashed_password=hash_password(payload.password),
        )
        token = create_access_token(f"operator:{operator.id}")
        return TokenResponse(access_token=token)

    async def login_operator(self, email: str, password: str) -> TokenResponse:
        operator = await self.operator_repo.get_by_email(email)
        if not operator or not verify_password(password, operator.hashed_password or ""):
            raise AppException(detail="Invalid credentials", code="invalid_credentials", status_code=401)
        token = create_access_token(f"operator:{operator.id}")
        return TokenResponse(access_token=token)

    async def login_rider(self, phone: str, password: str) -> TokenResponse:
        rider = await self.rider_repo.get_by_phone(phone)
        if not rider or not verify_password(password, rider.hashed_password):
            raise AppException(detail="Invalid credentials", code="invalid_credentials", status_code=401)
        token = create_access_token(f"rider:{rider.id}")
        return TokenResponse(access_token=token)

    async def google_signin(self, firebase_uid: str, email: str, name: str) -> TokenResponse:
        # 1. Try lookup by firebase_uid first (returning user)
        operator = await self.operator_repo.get_by_firebase_uid(firebase_uid)

        if not operator:
            # 2. Try email match (existing email/password account — link it)
            operator = await self.operator_repo.get_by_email(email)

        if not operator:
            # 3. Brand new user — create account automatically
            operator = await self.operator_repo.create_google(
                firebase_uid=firebase_uid,
                email=email,
                name=name,
            )
        elif not operator.firebase_uid:
            # 4. Existing email/password account — link Firebase UID to it
            await self.operator_repo.link_firebase_uid(operator, firebase_uid)

        token = create_access_token(f"operator:{operator.id}")
        return TokenResponse(access_token=token)
