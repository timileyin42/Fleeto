"""add email to riders

Revision ID: a7b8c9d0e102
Revises: f2a3b4c5d601
Create Date: 2026-04-27 00:01:00.000000

"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "a7b8c9d0e102"
down_revision = "f2a3b4c5d601"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("riders", sa.Column("email", sa.String(255), nullable=True))
    op.create_index("ix_riders_email", "riders", ["email"])


def downgrade() -> None:
    op.drop_index("ix_riders_email", table_name="riders")
    op.drop_column("riders", "email")
