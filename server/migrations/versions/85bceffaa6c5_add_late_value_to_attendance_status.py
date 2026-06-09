"""add late value to attendance_status

Revision ID: 85bceffaa6c5
Revises: cb41cdde47f8
Create Date: 2026-06-04 21:01:37.871386

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '85bceffaa6c5'
down_revision: Union[str, Sequence[str], None] = 'cb41cdde47f8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE attendance_status ADD VALUE IF NOT EXISTS 'late'")


def downgrade() -> None:
    """Downgrade schema."""
    # Postgres enum qiymatini olib tashlash murakkab — bo'sh qoldiramiz
    pass
