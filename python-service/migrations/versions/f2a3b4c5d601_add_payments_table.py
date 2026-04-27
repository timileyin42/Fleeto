"""add payments table

Revision ID: f2a3b4c5d601
Revises: a1b2c3d4e501
Create Date: 2026-04-27 00:00:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "f2a3b4c5d601"
down_revision = "a1b2c3d4e501"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "payments",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("operator_id", sa.UUID(), sa.ForeignKey("operators.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("reference", sa.String(100), nullable=False, unique=True, index=True),
        sa.Column("plan", sa.String(50), nullable=False),
        sa.Column("amount", sa.Integer, nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("payments")
