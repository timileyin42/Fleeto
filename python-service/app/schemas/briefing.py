import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import Field, field_validator, model_validator

from app.schemas.common import APIModel


class BriefingMetricCreate(APIModel):
    name: str = Field(min_length=1, max_length=100)
    value: Decimal
    unit: Optional[str] = Field(default=None, max_length=30)


class BriefingCreate(APIModel):
    company_name: str = Field(alias="companyName", min_length=1, max_length=255)
    ticker: str = Field(min_length=1, max_length=10)
    summary: str = Field(min_length=1, max_length=2000)
    recommendation: str = Field(min_length=1, max_length=100)
    key_points: list[str] = Field(alias="keyPoints", min_length=2)
    risks: list[str] = Field(min_length=1)
    metrics: list[BriefingMetricCreate] = Field(default_factory=list)

    @field_validator("ticker")
    @classmethod
    def ticker_must_be_uppercase(cls, value: str) -> str:
        return value.upper()

    @model_validator(mode="after")
    def metric_names_must_be_unique(self) -> "BriefingCreate":
        names = [metric.name.strip().lower() for metric in self.metrics]
        if len(names) != len(set(names)):
            raise ValueError("metrics must have unique names per briefing")
        return self


class BriefingMetricResponse(APIModel):
    name: str
    value: Decimal
    unit: Optional[str] = None


class BriefingResponse(APIModel):
    id: uuid.UUID
    company_name: str = Field(alias="companyName")
    ticker: str
    summary: str
    recommendation: str
    key_points: list[str] = Field(alias="keyPoints")
    risks: list[str]
    metrics: list[BriefingMetricResponse]
    created_at: datetime
