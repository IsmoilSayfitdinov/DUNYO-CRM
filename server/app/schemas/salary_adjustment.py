from datetime import date, datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SalaryAdjustmentCreate(BaseModel):
    employee_id: UUID
    type: Literal["advance", "bonus"]          # avans | premiya
    # Numeric(10,2) ustuni maks 99 999 999.99 ni ko'taradi — undan oshsa DB xato beradi.
    # Shuning uchun gt=0 (musbat) + le=99999999.99 (yuqori chegara) ikkalasi ham kerak.
    amount: Decimal = Field(gt=0, le=Decimal("99999999.99"), max_digits=10, decimal_places=2)
    note: str | None = Field(default=None, max_length=500)
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
