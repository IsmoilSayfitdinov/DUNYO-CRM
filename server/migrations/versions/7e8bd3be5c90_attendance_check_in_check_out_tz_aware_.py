"""attendance check_in check_out tz aware and employee

Revision ID: 7e8bd3be5c90
Revises: 85ef0774f062
Create Date: 2026-05-31 13:36:35.924796

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7e8bd3be5c90'
down_revision: Union[str, Sequence[str], None] = '85ef0774f062'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
