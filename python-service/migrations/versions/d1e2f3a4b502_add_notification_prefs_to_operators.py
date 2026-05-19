"""add notification_prefs to operators

Revision ID: d1e2f3a4b502
Revises: c2d3e4f5a603
Create Date: 2026-05-19 00:00:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "d1e2f3a4b502"
down_revision = "c2d3e4f5a603"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "operators",
        sa.Column(
            "notification_prefs",
            sa.JSON(),
            nullable=False,
            server_default='{"new_jobs": true, "status_updates": true, "payments": false}',
        ),
    )


def downgrade() -> None:
    op.drop_column("operators", "notification_prefs")
