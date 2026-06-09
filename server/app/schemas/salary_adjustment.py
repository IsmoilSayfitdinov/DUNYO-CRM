from datetime import date, datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SalaryAdjustmentCreate(BaseModel):
    employee_id: UUID
    type: Literal["advance", "bonus"]          # avans | premiya
    amount: Decimal = Field(gt=0)              # doim musbat
    note: str | None = None
    year: int = Field(ge=2000, le=2100)
    month: int = Field(ge=1, le=12)


class SalaryAdjustmentInfo(BaseModel):
    id: UUID
    employee_id: UUID
    type: str
    amount: Decimal
    note: str | None
    month: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SalaryAdjustmentWithEmployee(SalaryAdjustmentInfo):
    """Jamoaviy ro'yxat uchun — xodim ismi bilan."""
    employee_name: str
