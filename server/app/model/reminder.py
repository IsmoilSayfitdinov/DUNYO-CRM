from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.model.base import Base

if TYPE_CHECKING:
    from app.model.employee import Employee


class Reminder(Base):
    """Rahbar eslatmasi/ogohlantirishi — RAHBAR bitta XODIMGA yuboradi (bir martalik xabar).

    Task'dan farqi: bajariladigan ish emas, balki rasmiy eslatma/ogohlantirish
    (masalan kechikish, intizom). Status yo'q — faqat "o'qildi"mi (is_read).
    Yaratilganda xodimga push boradi.

    - created_by = yuborgan rahbar (leaders.id) → egalik/ro'yxat shu orqali.
    - employee_id = eslatma yuborilgan xodim.
    - severity = "info" (oddiy eslatma) | "warning" (ogohlantirish).
    """

    __tablename__ = "reminders"

    created_by: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("leaders.id"), nullable=False, index=True
    )
    employee_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("employees.id"), nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(nullable=False)
    message: Mapped[str | None] = mapped_column(default=None)
    severity: Mapped[str] = mapped_column(default="warning", server_default="warning")  # info | warning
    is_read: Mapped[bool] = mapped_column(default=False, server_default="false", nullable=False)

    employee: Mapped["Employee"] = relationship()
