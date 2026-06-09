"""add 'leave' value to attendance_status enum (ta'tilda — pulsiz)

Revision ID: c9d0e1f2a3b4
Revises: b8c9d0e1f2a3
Create Date: 2026-06-08

"""
from alembic import op


revision = "c9d0e1f2a3b4"
down_revision = "b8c9d0e1f2a3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ALTER TYPE ... ADD VALUE tranzaksiya ichida bajarilmaydi (PG < 12) —
    # avtomatik tranzaksiyani yopib, IF NOT EXISTS bilan qo'shamiz (idempotent).
    op.execute("COMMIT")
    op.execute("ALTER TYPE attendance_status ADD VALUE IF NOT EXISTS 'leave'")


def downgrade() -> None:
    # PostgreSQL enum qiymatini olib tashlash qo'llab-quvvatlanmaydi — no-op.
    pass
