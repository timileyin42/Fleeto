import uuid

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BriefingPoint(Base):
    __tablename__ = "briefing_points"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    briefing_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("briefings.id", ondelete="CASCADE"),
        nullable=False,
    )
    point_text: Mapped[str] = mapped_column(String(1000), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    briefing = relationship("Briefing", back_populates="points")
