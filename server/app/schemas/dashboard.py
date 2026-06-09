from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class DashboardOverview(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    late_today: int
    attendance_rate: float = Field(..., examples=[87.5])
    total_payroll: Decimal = Field(..., max_digits=12, decimal_places=2, examples=["39200000.00"])


class DashboardAlert(BaseModel):
    type: str = Field(..., examples=["absent", "late", "unpaid"])
    severity: str = Field(..., examples=["info", "warning", "danger"])
    message: str
    employee_id: UUID | None = None


class ActivityItem(BaseModel):
    type: str = Field(..., examples=["check_in", "check_out"])
    employee_name: str
    timestamp: datetime
    message: str


class TopEmployeeItem(BaseModel):
    employee_id: UUID
    name: str
    position: str | None = None
    score: int = Field(..., ge=0, le=100, examples=[95])
    present_days: int
    total_days: int
