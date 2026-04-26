"""add_customer_name_to_jobs

Revision ID: c3d9f1a2e501
Revises: 8b72c130fa6d
Create Date: 2026-04-25 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c3d9f1a2e501'
down_revision: Union[str, None] = '8b72c130fa6d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('jobs', sa.Column('customer_name', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('jobs', 'customer_name')
