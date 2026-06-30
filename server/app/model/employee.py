from typing import TYPE_CHECKING

from app.model.base import Base
from decimal import Decimal
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Uuid, DateTime
from sqlalchemy import Numeric
from datetime import datetime, time
from uuid import UUID

if TYPE_CHECKING:
    from app.model.user import User
    from app.model.leader import Leader
    from app.model.attendance import Attendance
    from app.model.salary_history import SalaryHistory
    from app.model.branch import Branch

class Employee(Base):
    __tablename__ = "employees"
    
    user_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    leader_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("leaders.id"),
        nullable=False
    )
    
    branch_id: Mapped[UUID | None] = mapped_column(
        Uuid,
        ForeignKey("branches.id"),
        nullable=True,
        default=None
    )
    
    is_active: Mapped[bool] = mapped_column(default=True, server_default="true")
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    
    position: Mapped[str | None] = mapped_column(default=None)
    
    shift_start: Mapped[time | None] = mapped_column(default=None)
    shift_end: Mapped[time | None] = mapped_column(default=None)
    shift_number: Mapped[int] = mapped_column(default=1, server_default="1")
    
    hourly_rate: Mapped[Decimal] = mapped_column(
        Numeric(10,2),
        default=Decimal("12000.00"),
        nullable=False
    )
    # unique=True — bitta NFC karta faqat bitta xodimga biriktiriladi (ikki xodim
    # bir kartani ulashsa, qaysi biri kelganini bilib bo'lmasdi). PostgreSQL'da
    # bir nechta NULL bir-biriga teng emas — kartasi yo'q xodimlar cheklanmaydi.
    nfc_uid: Mapped[str | None] = mapped_column(default=None, unique=True)
    user: Mapped["User"] = relationship(back_populates="employee")
    leader: Mapped["Leader"] = relationship(back_populates="employee")
    branch: Mapped["Branch | None"] = relationship(back_populates="employees")
    attendances: Mapped[list["Attendance"]] = relationship(back_populates="employee")
    salary_histories: Mapped[list["SalaryHistory"]] = relationship(back_populates="employee")