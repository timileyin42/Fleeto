from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Integer, String, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import OperatorPlan


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    operator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("operators.id", ondelete="CASCADE"), nullable=False, index=True)
    reference: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    plan: Mapped[OperatorPlan] = mapped_column(Enum(OperatorPlan, native_enum=False), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)  # kobo
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending | success | failed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    operator: Mapped["Operator"] = relationship("Operator")  # noqa: F821
