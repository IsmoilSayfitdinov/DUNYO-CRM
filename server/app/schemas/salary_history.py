from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID

from app.schemas.employee import EmployeeInfo

class SalaryHistoryInfo(BaseModel):
    id: UUID
    employee_id: UUID

    month: date
    total_hours: Decimal = Field(..., max_digits=10, decimal_places=2, examples=["11.5"])
    base_salary: Decimal = Field(..., max_digits=10, decimal_places=2, examples=["15000.00"])
    final_salary: Decimal = Field(..., max_digits=10, decimal_places=2, examples=["3000000.00"])
    bonus: Decimal = Field(..., max_digits=10, decimal_places=2, examples=["300000.00"])
    note: str | None = None
    days_worked: int

    is_paid: bool
    calculated_at: datetime
    paid_at: datetime | None = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SalaryAdjustRequest(BaseModel):
    # Musbat qiymat = premiya (bonus); manfiy qiymat = avans/ushlab qolish.
    # final_salary = base_salary + bonus, shuning uchun avans manfiy yuboriladi.
    bonus: Decimal = Field(
        ..., ge=Decimal("-99999999.99"), le=Decimal("99999999.99"),
        max_digits=10, decimal_places=2, examples=["200000.00"],
    )
    note: str | None = Field(None, max_length=500)


class SalarySummary(BaseModel):
    total: int
    paid_count: int
    unpaid_count: int
    total_paid: Decimal
    total_unpaid: Decimal
    
class SalaryWithEmployeeInfo(SalaryHistoryInfo):
    employee: EmployeeInfo
    
    
class SalaryTrendItem(BaseModel):
    month: date
    total: Decimal