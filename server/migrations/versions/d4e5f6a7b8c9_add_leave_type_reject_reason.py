"""add type + reject_reason to leave_requests

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-06-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, Sequence[str], None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("leave_requests", sa.Column("type", sa.String(), nullable=True))
    op.add_column("leave_requests", sa.Column("reject_reason", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("leave_requests", "reject_reason")
    op.drop_column("leave_requests", "type")
