import logging
from datetime import date, timedelta

from fastapi import Depends

from app.core.timezone import today_local
from app.enum.attendance_status import AttendanceStatus
from app.model.attendance import Attendance
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.leave_request_repository import LeaveRequestRepository

logger = logging.getLogger("app.attendance.backfill")


class AttendanceBackfillService:
    """Kelmagan kunlarni AVTOMATIK to'ldiradi.

    Mantiq (bitta kun uchun): o'sha kunda davomat yozuvi BO'LMAGAN har bir faol
    xodimga yozuv qo'yiladi:
      - tasdiqlangan ta'tilda bo'lsa  -> status = leave   (ta'tilda, pulsiz)
      - aks holda                     -> status = absent  (kelmadi, pulsiz)

    "Har kun ish kuni" — dam olish kunlari ajratilmaydi (kelishilgan eng sodda variant).
    check_in/check_out = None bo'lgani uchun bu yozuvlar oylikka pul qo'shmaydi.
    """

    def __init__(
        self,
        attendance_repo: AttendanceRepository = Depends(),
        employee_repo: EmployeeRepository = Depends(),
        leave_repo: LeaveRequestRepository = Depends(),
    ):
        self.attendance_repo = attendance_repo
        self.employee_repo = employee_repo
        self.leave_repo = leave_repo

    async def backfill_day(self, work_date: date) -> dict:
        """Bitta kun uchun kelmaganlarni to'ldiradi. {absent, leave} sonini qaytaradi."""
        # Faqat faol va o'chirilmagan xodimlar (get_all soft-delete'ni allaqachon filtrlaydi)
        employees = await self.employee_repo.get_all(limit=10_000, offset=0)
        active = [e for e in employees if e.is_active]
        if not active:
            return {"absent": 0, "leave": 0, "date": work_date.isoformat()}

        already = await self.attendance_repo.employee_ids_with_record_on(work_date)
        on_leave = await self.leave_repo.employee_ids_on_approved_leave(work_date)

        # In-batch dedup: bitta backfill ichida bir xodim ikki marta qo'shilmasin
        # (active ro'yxatida takror bo'lsa ham). `already` DB'dagi mavjud yozuvni
        # ushlaydi; `seen` shu sikl ichidagi takrorni ushlaydi.
        seen: set = set()
        to_create: list[Attendance] = []
        absent_n = leave_n = 0
        for e in active:
            if e.id in already or e.id in seen:
                continue  # o'sha kun yozuvi bor (keldi yoki qo'lda belgilangan) — tegmaymiz
            seen.add(e.id)
            if e.id in on_leave:
                status = AttendanceStatus.leave
                leave_n += 1
            else:
                status = AttendanceStatus.absent
                absent_n += 1
            to_create.append(Attendance(
                employee_id=e.id,
                work_date=work_date,
                check_in=None,
                check_out=None,
                status=status,
                is_late=False,
            ))

        await self.attendance_repo.bulk_create(to_create)
        logger.info("Davomat backfill %s: %d absent, %d leave", work_date, absent_n, leave_n)
        return {"absent": absent_n, "leave": leave_n, "date": work_date.isoformat()}

    async def backfill_yesterday(self) -> dict:
        """Kunlik job: kechagi kunni to'ldiradi (kun to'liq tugagandan keyin)."""
        return await self.backfill_day(today_local() - timedelta(days=1))

    async def backfill_range(self, start: date, end: date) -> list[dict]:
        """Oraliqdagi har bir kunni to'ldiradi (o'tgan kunlarni bir martalik to'ldirish uchun)."""
        out: list[dict] = []
        cur = start
        while cur <= end:
            out.append(await self.backfill_day(cur))
            cur += timedelta(days=1)
        return out

    async def apply_approved_leave(self, employee_id, start: date, end: date) -> int:
        """Ta'til TASDIQLANGANDA chaqiriladi — oraliqdagi O'TGAN/BUGUNGI kunlarni
        'leave' (ta'tilda) qiladi:
          - yozuv yo'q kun -> yangi 'leave' yozuvi
          - mavjud 'absent' yozuvi -> 'leave' ga o'zgartiriladi
          - keldi/sababli (came/late/left/reason) -> TEGILMAYDI (xodim o'sha kun ishlagan)
        Kelajak kunlar tegilmaydi — ularni kunlik avto-job o'sha kun kelganda yozadi.
        O'zgartirilgan/yaratilgan kunlar sonini qaytaradi.
        """
        today = today_local()
        last = min(end, today)
        if start > last:
            return 0  # butun ta'til kelajakda — hozir hech narsa qilinmaydi

        existing = await self.attendance_repo.get_in_range(employee_id, start, last)
        by_date = {a.work_date: a for a in existing}

        changed = 0
        to_create: list[Attendance] = []
        cur = start
        while cur <= last:
            rec = by_date.get(cur)
            if rec is None:
                to_create.append(Attendance(
                    employee_id=employee_id, work_date=cur,
                    check_in=None, check_out=None,
                    status=AttendanceStatus.leave, is_late=False,
                ))
                changed += 1
            elif rec.status == AttendanceStatus.absent:
                rec.status = AttendanceStatus.leave  # kelmagan deb belgilangan edi — endi ta'tilda
                changed += 1
            cur += timedelta(days=1)

        if to_create:
            self.attendance_repo.database.add_all(to_create)
        await self.attendance_repo.database.commit()
        logger.info("Ta'til qo'llandi xodim=%s %s..%s: %d kun leave", employee_id, start, last, changed)
        return changed
