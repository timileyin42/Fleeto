import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import OperatorPlan


class Operator(Base):
    __tablename__ = "operators"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    firebase_uid: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, unique=True, index=True)
    profile_picture_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    plan: Mapped[OperatorPlan] = mapped_column(
        Enum(OperatorPlan, native_enum=False),
        nullable=False,
        default=OperatorPlan.starter,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    riders: Mapped[List["Rider"]] = relationship(  # noqa: F821
        "Rider", back_populates="operator", cascade="all, delete-orphan"
    )
    jobs: Mapped[List["Job"]] = relationship(  # noqa: F821
        "Job", back_populates="operator", cascade="all, delete-orphan"
    )
