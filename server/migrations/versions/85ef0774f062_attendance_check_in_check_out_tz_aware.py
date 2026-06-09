"""attendance check_in check_out tz aware

Revision ID: 85ef0774f062
Revises: b67853ff8efe
Create Date: 2026-05-31 13:35:49.186409

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '85ef0774f062'
down_revision: Union[str, Sequence[str], None] = 'b67853ff8efe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
