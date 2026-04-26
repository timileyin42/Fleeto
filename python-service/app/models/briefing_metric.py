import uuid
from decimal import Decimal
from typing import Optional

from sqlalchemy import ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BriefingMetric(Base):
    __tablename__ = "briefing_metrics"
    __table_args__ = (UniqueConstraint("briefing_id", "name", name="uq_metric_name_per_briefing"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    briefing_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("briefings.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[Decimal] = mapped_column(Numeric(20, 4), nullable=False)
    unit: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)

    briefing = relationship("Briefing", back_populates="metrics")
