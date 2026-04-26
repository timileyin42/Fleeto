import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class LocationPing(Base):
    __tablename__ = "location_pings"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("jobs.id"), nullable=False, index=True)
    rider_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("riders.id"), nullable=False, index=True)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    job: Mapped["Job"] = relationship("Job", back_populates="location_pings")  # noqa: F821
    rider: Mapped["Rider"] = relationship("Rider", back_populates="location_pings")  # noqa: F821
