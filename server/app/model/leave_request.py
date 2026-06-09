from datetime import date
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Enum, ForeignKey, Uuid          
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enum.leave_request_status import LeaveRequestStatus
from app.model.base import Base

if TYPE_CHECKING:
    from app.model.employee import Employee


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    employee_id: Mapped[UUID] = mapped_column(Uuid, ForeignKey("employees.id"), nullable=False)

    type: Mapped[str | None] = mapped_column(default=None)   # ta'til turi (Annual/Sick/...)
    start_date: Mapped[date] = mapped_column(nullable=False)
    end_date: Mapped[date] = mapped_column(nullable=False)
    reason: Mapped[str | None] = mapped_column(default=None)            # xodimning sababi
    reject_reason: Mapped[str | None] = mapped_column(default=None)     # rahbarning rad sababi

    status: Mapped[LeaveRequestStatus] = mapped_column(
        Enum(LeaveRequestStatus, name="leave_request_status"),
        default=LeaveRequestStatus.pending,
    )

    employee: Mapped["Employee"] = relationship()
