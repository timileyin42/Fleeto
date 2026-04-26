import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import RiderStatus


class Rider(Base):
    __tablename__ = "riders"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    operator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("operators.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    profile_picture_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[RiderStatus] = mapped_column(
        Enum(RiderStatus, native_enum=False),
        nullable=False,
        default=RiderStatus.available,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    operator: Mapped["Operator"] = relationship("Operator", back_populates="riders")  # noqa: F821
    jobs: Mapped[List["Job"]] = relationship("Job", back_populates="rider")  # noqa: F821
    location_pings: Mapped[List["LocationPing"]] = relationship(  # noqa: F821
        "LocationPing", back_populates="rider"
    )
