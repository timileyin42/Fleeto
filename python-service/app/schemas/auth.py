import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from app.models.enums import OperatorPlan


class OperatorRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class OperatorLogin(BaseModel):
    email: EmailStr
    password: str


class RiderLogin(BaseModel):
    phone: str
    password: str


class GoogleSignIn(BaseModel):
    id_token: str  # Firebase ID token from the frontend


class OtpSentResponse(BaseModel):
    message: str
    email: str


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class OperatorUpdate(BaseModel):
    name: str


class OperatorResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    plan: OperatorPlan
    profile_picture_url: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
