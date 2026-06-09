from datetime import date, datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime, Enum, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enum.task_priority import TaskPriority
from app.enum.task_status import TaskStatus
from app.model.base import Base

if TYPE_CHECKING:
    from app.model.employee import Employee


class Task(Base):
    """Vazifa — RAHBAR yaratadi, bitta XODIMGA biriktiradi.

    - created_by = yaratgan rahbar (leaders.id) → "mening vazifalarim" va IDOR shu orqali.
    - employee_id = vazifa biriktirilgan xodim (assignee).
    - status'ni xodim o'zgartiradi (todo → in_progress → done); done bo'lganda completed_at.
    """

    __tablename__ = "tasks"

    title: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str | None] = mapped_column(default=None)

    # Kim yaratdi (rahbar) — egalik/ro'yxat shu bo'yicha
    created_by: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("leaders.id"), nullable=False, index=True
    )
    # Kimga (assignee xodim)
    employee_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("employees.id"), nullable=False, index=True
    )

    priority: Mapped[TaskPriority] = mapped_column(Enum(TaskPriority, name="task_priority"), nullable=False)
    status: Mapped[TaskStatus] = mapped_column(Enum(TaskStatus, name="task_status"), default=TaskStatus.todo)

    due_date: Mapped[date] = mapped_column(nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)

    employee: Mapped["Employee"] = relationship()
