from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ReminderCreate(BaseModel):
    """Rahbar xodimga eslatma/ogohlantirish yuboradi."""
    employee_id: UUID
    title: str = Field(min_length=1, max_length=200)
    message: str | None = Field(default=None, max_length=2000)
    severity: Literal["info", "warning"] = "warning"


class ReminderInfo(BaseModel):
    id: UUID
    employee_id: UUID
    created_by: UUID
    title: str
    message: str | None
    severity: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReminderWithEmployee(ReminderInfo):
    """Rahbar ro'yxati uchun — xodim ismi bilan."""
    employee_name: str
