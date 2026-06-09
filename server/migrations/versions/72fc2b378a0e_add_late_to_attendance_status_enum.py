"""add late to attendance_status enum

Revision ID: 72fc2b378a0e
Revises: 7e8bd3be5c90
Create Date: 2026-06-04 20:55:09.616332

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '72fc2b378a0e'
down_revision: Union[str, Sequence[str], None] = '7e8bd3be5c90'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
