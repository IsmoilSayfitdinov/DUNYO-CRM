from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Numeric, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.model.base import Base

if TYPE_CHECKING:
    from app.model.employee import Employee


class SalaryAdjustment(Base):
    """Xodimga berilgan AVANS (advance) yoki PREMIYA (bonus) — HAR BIRI ALOHIDA yozuv.

    - Oylik hisoblanmasa ham beriladi (faqat employee_id + month bog'lanadi).
    - Oylik hisoblanganda o'sha oyning yig'indisi final_salary'ga qo'llanadi:
        advance (avans) -> AYIRILADI,  bonus (premiya) -> QO'SHILADI.
    - amount har doim MUSBAT; yo'nalishni `type` belgilaydi.
    """

    __tablename__ = "salary_adjustments"

    employee_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("employees.id"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(nullable=False)  # "advance" | "bonus"
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    note: Mapped[str | None] = mapped_column(default=None)
    month: Mapped[date] = mapped_column(nullable=False, index=True)  # oyning 1-kuni
    given_by: Mapped[UUID | None] = mapped_column(Uuid, default=None)  # rahbar user id

    employee: Mapped["Employee"] = relationship()
