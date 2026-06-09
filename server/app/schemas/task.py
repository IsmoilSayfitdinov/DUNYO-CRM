from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.enum.task_priority import TaskPriority
from app.enum.task_status import TaskStatus


class TaskCreate(BaseModel):
    """Rahbar yangi vazifa yaratadi (xodimga)."""
    employee_id: UUID
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    priority: TaskPriority = TaskPriority.medium
    due_date: date


class TaskStatusUpdate(BaseModel):
    """Xodim vazifa holatini o'zgartiradi."""
    status: TaskStatus


class TaskInfo(BaseModel):
    id: UUID
    title: str
    description: str | None
    employee_id: UUID
    created_by: UUID
    priority: TaskPriority
    status: TaskStatus
    due_date: date
    completed_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskWithEmployee(TaskInfo):
    """Rahbar ro'yxati uchun — xodim ismi bilan."""
    employee_name: str
