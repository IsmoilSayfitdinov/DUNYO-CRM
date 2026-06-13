"""fix open-attendance unique index: restrict to active shifts (came/late)

Eski indeks faqat "check_out IS NULL" bo'yicha edi. Lekin absent/leave/reason
yozuvlari ham check_out=NULL bo'ladi (ular "chiqish" tushunchasiga ega emas).
Shu sababli kechagi absent/leave yozuvi "bitta ochiq slot"ni band qilib,
xodimning bugungi check-in'ini bloklab qo'yardi (IntegrityError -> noto'g'ri 409).

Yangi indeks shartiga `status IN ('came', 'late')` qo'shamiz — endi indeks
faqat HAQIQIY ochiq smenalarni hisoblaydi.

Revision ID: a1b2c3d4e5f7
Revises: c9d0e1f2a3b4
Create Date: 2026-06-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f7'
down_revision: Union[str, Sequence[str], None] = 'c9d0e1f2a3b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Indeks sharti — model/attendance.py bilan bir xil bo'lishi SHART.
_OLD_WHERE = "check_out IS NULL"
_NEW_WHERE = "check_out IS NULL AND status IN ('came', 'late')"


def upgrade() -> None:
    """Eski (juda keng) indeksni yangi (smenaga cheklangan) bilan almashtiramiz."""
    # Eski indeks bo'lmasligi ham mumkin (f1a2b3c4d5e6 hali qo'llanmagan bo'lsa)
    # — IF EXISTS bilan xavfsiz o'chiramiz.
    op.execute("DROP INDEX IF EXISTS uq_attendance_open_per_employee")

    # Yangi shartli unique indeks. DIQQAT: agar hozir bir xodimda 2+ ochiq
    # came/late yozuvi bo'lsa, indeks yaratilmaydi — avval ularni qo'lda
    # tozalash kerak. (absent/leave/reave ochiq yozuvlari endi indeksga
    # kirmagani uchun ular muammo tug'dirmaydi.)
    op.create_index(
        "uq_attendance_open_per_employee",
        "attendances",
        ["employee_id"],
        unique=True,
        postgresql_where=sa.text(_NEW_WHERE),
    )


def downgrade() -> None:
    """Avvalgi (keng) indeksga qaytaramiz."""
    op.execute("DROP INDEX IF EXISTS uq_attendance_open_per_employee")
    op.create_index(
        "uq_attendance_open_per_employee",
        "attendances",
        ["employee_id"],
        unique=True,
        postgresql_where=sa.text(_OLD_WHERE),
    )
