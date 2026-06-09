"""add reason to attendance_status enum

Revision ID: e24b86286417
Revises: e7f596914d85
Create Date: 2026-06-06 18:36:23.330097

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e24b86286417'
down_revision: Union[str, Sequence[str], None] = 'e7f596914d85'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE attendance_status ADD VALUE IF NOT EXISTS 'reason'")


def downgrade() -> None:
    """Downgrade schema."""
    # Postgres enum qiymatini olib tashlash murakkab — bo'sh qoldiramiz
    pass
