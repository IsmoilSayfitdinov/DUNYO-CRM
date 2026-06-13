from uuid import UUID

from app.enum.attendance_status import AttendanceStatus
from app.model.base import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum, ForeignKey, Index, Uuid, DateTime, text
from datetime import date, datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.model.employee import Employee

class Attendance(Base):
    __tablename__ = "attendances"
    __table_args__ = (
        # Bir xodimda bir vaqtning o'zida faqat BITTA ochiq smena bo'lishi mumkin —
        # bir vaqtda ikki marta check-in (race) DB darajasida bloklanadi.
        #
        # DIQQAT: shart "check_out IS NULL" emas, balki "check_out IS NULL AND
        # status IN (came, late)". Sababi: absent/leave/reason yozuvlari ham
        # check_out=NULL bo'ladi (ular "chiqish" tushunchasiga ega emas), lekin
        # ular OCHIQ SMENA EMAS. Agar indeks ularni ham hisoblasa, kechagi
        # absent/leave yozuvi "bitta ochiq slot"ni band qilib, xodimning bugungi
        # check-in'ini bloklab qo'yadi (IntegrityError -> noto'g'ri 409).
        Index(
            "uq_attendance_open_per_employee",
            "employee_id",
            unique=True,
            postgresql_where=text("check_out IS NULL AND status IN ('came', 'late')"),
            sqlite_where=text("check_out IS NULL AND status IN ('came', 'late')"),
        ),
    )

    employee_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("employees.id"),
        nullable=False
    )
    status: Mapped[AttendanceStatus] = mapped_column(
        Enum(AttendanceStatus, name="attendance_status"),
        default=AttendanceStatus.absent,
        nullable=False
    )

    work_date: Mapped[date] = mapped_column(default=date.today)
    check_in: Mapped[datetime | None] = mapped_column(DateTime(timezone=True) ,default=None)
    check_out: Mapped[datetime | None] = mapped_column(DateTime(timezone=True),default=None)
    # Kelgan vaqt smena boshlanishidan kechmi — bu flag check-out'dan keyin ham
    # saqlanadi (status "left"ga o'zgargach ham), shu sababli reyting to'g'ri.
    is_late: Mapped[bool] = mapped_column(default=False, server_default="false", nullable=False)
    notes: Mapped[str | None] = mapped_column(default=None)

    employee: Mapped["Employee"] = relationship(back_populates="attendances")
    