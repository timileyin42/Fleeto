from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_auth_service, get_current_operator, get_current_rider, get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.operator_repo import OperatorRepository
from app.core.firebase import verify_firebase_token
from app.models.operator import Operator
from app.models.rider import Rider
from app.schemas.auth import GoogleSignIn, OperatorLogin, OperatorRegister, OperatorResponse, OperatorUpdate, OtpSentResponse, RiderLogin, TokenResponse, VerifyOtpRequest
from app.schemas.rider import RiderResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=OtpSentResponse, status_code=status.HTTP_200_OK)
@router.post("/operator/register", response_model=OtpSentResponse, status_code=status.HTTP_200_OK, include_in_schema=False)
async def register_operator(
    payload: OperatorRegister,
    service: AuthService = Depends(get_auth_service),
) -> OtpSentResponse:
    return await service.register_operator(payload)


@router.post("/verify-otp", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def verify_otp(
    payload: VerifyOtpRequest,
    service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    return await service.verify_otp(payload.email, payload.code)


@router.post("/resend-otp", response_model=OtpSentResponse, status_code=status.HTTP_200_OK)
async def resend_otp(
    payload: VerifyOtpRequest,
    service: AuthService = Depends(get_auth_service),
) -> OtpSentResponse:
    return await service.resend_otp(payload.email)


@router.post("/operator/login", response_model=TokenResponse)
async def login_operator(
    payload: OperatorLogin,
    service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    return await service.login_operator(payload.email, payload.password)


@router.post("/rider/login", response_model=TokenResponse)
async def login_rider(
    payload: RiderLogin,
    service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    return await service.login_rider(payload.phone, payload.password)


@router.post("/google", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def google_signin(
    payload: GoogleSignIn,
    service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    try:
        decoded = verify_firebase_token(payload.id_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")

    return await service.google_signin(
        firebase_uid=decoded["uid"],
        email=decoded.get("email", ""),
        name=decoded.get("name", ""),
    )


@router.get("/me", response_model=OperatorResponse)
async def get_me(
    current_operator: Operator = Depends(get_current_operator),
) -> Operator:
    return current_operator


@router.patch("/me", response_model=OperatorResponse)
async def update_me(
    payload: OperatorUpdate,
    current_operator: Operator = Depends(get_current_operator),
    db: AsyncSession = Depends(get_db),
) -> Operator:
    repo = OperatorRepository(db)
    return await repo.update_name(current_operator, payload.name.strip())


@router.get("/rider/me", response_model=RiderResponse)
async def get_rider_me(
    current_rider: Rider = Depends(get_current_rider),
) -> Rider:
    return current_rider
