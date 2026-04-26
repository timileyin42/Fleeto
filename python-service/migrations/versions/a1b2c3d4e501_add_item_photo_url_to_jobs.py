"""add_item_photo_url_to_jobs

Revision ID: a1b2c3d4e501
Revises: c3d9f1a2e501
Create Date: 2026-04-26 08:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e501'
down_revision: Union[str, None] = 'c3d9f1a2e501'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('jobs', sa.Column('item_photo_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column('jobs', 'item_photo_url')
