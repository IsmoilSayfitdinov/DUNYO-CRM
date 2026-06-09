"""add tasks.created_by + tasks.completed_at and reminders table

Revision ID: b8c9d0e1f2a3
Revises: a7b8c9d0e1f2
Create Date: 2026-06-08

"""
from alembic import op
import sqlalchemy as sa


revision = "b8c9d0e1f2a3"
down_revision = "a7b8c9d0e1f2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- tasks: created_by (rahbar) + completed_at ---
    # Mavjud qatorlar uchun created_by NULL bo'lmasligi kerak — har bir xodimning
    # leader_id'si bo'yicha to'ldiramiz (vaqtincha NULL qo'shib, keyin set + not null).
    op.add_column("tasks", sa.Column("created_by", sa.Uuid(), nullable=True))
    op.execute(
        "UPDATE tasks t SET created_by = e.leader_id "
        "FROM employees e WHERE e.id = t.employee_id AND t.created_by IS NULL"
    )
    op.alter_column("tasks", "created_by", nullable=False)
    op.create_index("ix_tasks_created_by", "tasks", ["created_by"])
    op.create_index("ix_tasks_employee_id", "tasks", ["employee_id"])
    op.create_foreign_key("fk_tasks_created_by_leaders", "tasks", "leaders", ["created_by"], ["id"])
    op.add_column("tasks", sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True))

    # --- reminders (rahbar eslatmalari / ogohlantirish) ---
    op.create_table(
        "reminders",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_by", sa.Uuid(), nullable=False),
        sa.Column("employee_id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("message", sa.String(), nullable=True),
        sa.Column("severity", sa.String(), server_default="warning", nullable=False),
        sa.Column("is_read", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["leaders.id"]),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reminders_created_by", "reminders", ["created_by"])
    op.create_index("ix_reminders_employee_id", "reminders", ["employee_id"])


def downgrade() -> None:
    op.drop_index("ix_reminders_employee_id", table_name="reminders")
    op.drop_index("ix_reminders_created_by", table_name="reminders")
    op.drop_table("reminders")

    op.drop_column("tasks", "completed_at")
    op.drop_constraint("fk_tasks_created_by_leaders", "tasks", type_="foreignkey")
    op.drop_index("ix_tasks_employee_id", table_name="tasks")
    op.drop_index("ix_tasks_created_by", table_name="tasks")
    op.drop_column("tasks", "created_by")
