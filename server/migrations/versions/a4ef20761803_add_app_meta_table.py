"""add app_meta table

Revision ID: a4ef20761803
Revises: 4a86d24d218c
Create Date: 2026-06-30 12:28:04.687489

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a4ef20761803'
down_revision: Union[str, Sequence[str], None] = '4a86d24d218c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Faqat app_meta jadvalini qo'shamiz. (Autogenerate eski 'User' jadvalni
    # o'chirmoqchi bo'lgan — bu shu migratsiyaga taalluqli emas, qo'lda olib tashlandi.)
    op.create_table('app_meta',
    sa.Column('key', sa.String(), nullable=False),
    sa.Column('value', sa.String(), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_app_meta_key'), 'app_meta', ['key'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_app_meta_key'), table_name='app_meta')
    op.drop_table('app_meta')
