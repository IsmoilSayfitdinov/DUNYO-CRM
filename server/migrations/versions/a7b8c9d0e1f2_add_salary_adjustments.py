"""add salary_adjustments table (avans/premiya, itemized)

Revision ID: a7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-06-08

"""
from alembic import op
import sqlalchemy as sa


revision = "a7b8c9d0e1f2"
down_revision = "f6a7b8c9d0e1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "salary_adjustments",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("employee_id", sa.Uuid(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("note", sa.String(), nullable=True),
        sa.Column("month", sa.Date(), nullable=False),
        sa.Column("given_by", sa.Uuid(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_salary_adjustments_employee_id", "salary_adjustments", ["employee_id"])
    op.create_index("ix_salary_adjustments_month", "salary_adjustments", ["month"])


def downgrade() -> None:
    op.drop_index("ix_salary_adjustments_month", table_name="salary_adjustments")
    op.drop_index("ix_salary_adjustments_employee_id", table_name="salary_adjustments")
    op.drop_table("salary_adjustments")
