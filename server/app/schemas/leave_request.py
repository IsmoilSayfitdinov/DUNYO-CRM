from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.enum.leave_request_status import LeaveRequestStatus


class LeaveRequestCreate(BaseModel):
    type: str | None = Field(None, max_length=64)
    start_date: date
    end_date: date
    reason: str | None = Field(None, max_length=1000)

    @model_validator(mode="after")
    def _check_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("Tugash sanasi boshlanish sanasidan oldin bo'lishi mumkin emas !")
        return self


class LeaveRejectRequest(BaseModel):
    reason: str = Field(..., min_length=1, max_length=1000)


class LeaveRequestInfo(BaseModel):
    id: UUID
    employee_id: UUID
    employee_name: str | None = None      # rahbar ko'rinishi uchun
    type: str | None = None
    start_date: date
    end_date: date
    days: int                              # hisoblangan (start..end, ikkalasi ham kiradi)
    reason: str | None = None
    reject_reason: str | None = None
    status: LeaveRequestStatus
    created_at: datetime
