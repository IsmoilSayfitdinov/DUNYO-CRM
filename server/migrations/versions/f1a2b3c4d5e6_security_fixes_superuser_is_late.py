"""security/correctness fixes: superuser role, attendance.is_late, open-attendance unique index

Revision ID: f1a2b3c4d5e6
Revises: 891e8fd7d4c9
Create Date: 2026-06-07 18:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = '891e8fd7d4c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1) "superuser" rolini Postgres enum'iga qo'shamiz (alohida autocommit blok).
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE role ADD VALUE IF NOT EXISTS 'superuser'")

    # 2) attendances.is_late — kelishdagi kechikish flagi (check-out'dan keyin ham saqlanadi).
    op.add_column(
        "attendances",
        sa.Column("is_late", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    # Tarixiy ma'lumotni backfill: status='late' bo'lgan yozuvlarni is_late=true qilamiz.
    op.execute("UPDATE attendances SET is_late = true WHERE status = 'late'")

    # 3) Bir xodimda bir vaqtda faqat BITTA ochiq (check_out IS NULL) yozuv bo'lsin —
    #    bir vaqtda ikki marta check-in (race) DB darajasida bloklanadi.
    #    DIQQAT: agar hozir bir xodimda 2+ ochiq yozuv bo'lsa, index yaratilmaydi —
    #    avval ularni tozalash kerak bo'ladi.
    op.create_index(
        "uq_attendance_open_per_employee",
        "attendances",
        ["employee_id"],
        unique=True,
        postgresql_where=sa.text("check_out IS NULL"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("uq_attendance_open_per_employee", table_name="attendances")
    op.drop_column("attendances", "is_late")
    # Postgres enum qiymatini ('superuser') olib tashlash murakkab — bo'sh qoldiramiz.
