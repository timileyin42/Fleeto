import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Briefing(Base):
    __tablename__ = "briefings"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    ticker: Mapped[str] = mapped_column(String(10), nullable=False)
    summary: Mapped[str] = mapped_column(String(2000), nullable=False)
    recommendation: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    points = relationship("BriefingPoint", back_populates="briefing", cascade="all, delete-orphan")
    risks = relationship("BriefingRisk", back_populates="briefing", cascade="all, delete-orphan")
    metrics = relationship("BriefingMetric", back_populates="briefing", cascade="all, delete-orphan")
