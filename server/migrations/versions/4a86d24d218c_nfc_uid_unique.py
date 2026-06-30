"""nfc_uid unique constraint

Revision ID: 4a86d24d218c
Revises: 5afe90e55b27
Create Date: 2026-06-29

Bitta NFC karta faqat bitta xodimga biriktirilishi uchun unique constraint.
PostgreSQL'da bir nechta NULL bir-biriga teng emas, shuning uchun kartasi
yo'q (nfc_uid IS NULL) xodimlar cheklanmaydi.
"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '4a86d24d218c'
down_revision: Union[str, Sequence[str], None] = '5afe90e55b27'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_unique_constraint('uq_employees_nfc_uid', 'employees', ['nfc_uid'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('uq_employees_nfc_uid', 'employees', type_='unique')
