import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import JobStatus


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    operator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("operators.id"), nullable=False, index=True)
    rider_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("riders.id"), nullable=True, index=True)
    customer_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    pickup_address: Mapped[str] = mapped_column(String(500), nullable=False)
    dropoff_address: Mapped[str] = mapped_column(String(500), nullable=False)
    parcel_description: Mapped[str] = mapped_column(String(500), nullable=False)
    customer_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    status: Mapped[JobStatus] = mapped_column(
        Enum(JobStatus, native_enum=False),
        nullable=False,
        default=JobStatus.created,
    )
    tracking_token: Mapped[str] = mapped_column(
        String(36), nullable=False, unique=True, default=lambda: str(uuid.uuid4())
    )
    item_photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    proof_photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    operator: Mapped["Operator"] = relationship("Operator", back_populates="jobs")  # noqa: F821
    rider: Mapped[Optional["Rider"]] = relationship("Rider", back_populates="jobs")  # noqa: F821
    location_pings: Mapped[List["LocationPing"]] = relationship(  # noqa: F821
        "LocationPing", back_populates="job"
    )
