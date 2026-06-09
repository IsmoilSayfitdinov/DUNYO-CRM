from datetime import date, datetime
from uuid import UUID

from sqlalchemy import DateTime, Uuid, ForeignKey, Numeric, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from decimal import Decimal
from app.model.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.model.employee import Employee
    
class SalaryHistory(Base):
    __tablename__ = "salary_histories"
    __table_args__ = (
        UniqueConstraint("employee_id", "month", name="unique_employee_month_salary"),
    )
    employee_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("employees.id"),
        nullable=False
    )
    
    month: Mapped[date] = mapped_column(default=date.today)

    total_hours: Mapped[Decimal] = mapped_column(
        Numeric(10,2),
        default=Decimal("0.00"),
        nullable=False 
    )
    
    base_salary: Mapped[Decimal] = mapped_column(
        Numeric(10,2),
        default=Decimal("0.00"),
        nullable=False
    )
    
    final_salary: Mapped[Decimal] = mapped_column(
        Numeric(10,2),
        default=Decimal("0.00"),
        nullable=False
    )
    
    bonus: Mapped[Decimal] = mapped_column(
        Numeric(10,2),
        default=Decimal("0.00"),
        nullable=False,
        server_default="0.00"
    )
    
    days_worked: Mapped[int] = mapped_column(default=0)

    # Oxirgi tuzatish izohi (premiya/avans sababi)
    note: Mapped[str | None] = mapped_column(default=None)

    calculated_at: Mapped[datetime] = mapped_column(server_default=func.now())
    is_paid: Mapped[bool] = mapped_column(default=False)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    
    employee: Mapped["Employee"] = relationship(back_populates="salary_histories")