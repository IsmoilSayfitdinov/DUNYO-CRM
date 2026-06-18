from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.core.timezone import now_utc, today_local
from app.enum.attendance_status import AttendanceStatus
from app.helper.get_current_employee import get_current_employee
from app.helper.verify_leader_owns_employee import verify_leader_owns_employee
import logging

from app.model.salary_adjustment import SalaryAdjustment
from app.model.salary_history import SalaryHistory
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.leader_repository import LeaderRepository
from app.repositories.leave_request_repository import LeaveRequestRepository
from app.repositories.salary_adjustment_repository import SalaryAdjustmentRepository
from app.repositories.salary_history_repository import SalaryHistoryRepository
from app.schemas.salary_adjustment import SalaryAdjustmentCreate, SalaryAdjustmentInfo, SalaryAdjustmentWithEmployee
from app.schemas.salary_history import SalaryHistoryInfo, SalarySummary, SalaryTrendItem, SalaryWithEmployeeInfo
from app.services.attendance_backfill_services import AttendanceBackfillService
from app.services.notification_services import NotificationService

logger = logging.getLogger("app.salary")


def _money(v: Decimal) -> str:
    """123456 -> "123 456" (probel bilan)."""
    return f"{int(v):,}".replace(",", " ")


class SalaryHistoryServices:
    MAX_EXCUSED_DAYS = 2  # oyiga maks. sababli (notes bor) absent kun — to'lanadi
    # Bitta smena uchun maksimal to'lanadigan soat. Xodim chiqishni unutsa, smena
    # bir necha kunga "ochiq" qolib, 100+ soatga aylanishi mumkin — bu cheksiz pulga
    # olib keladi. Shuning uchun har bir smenani shu chegaragacha qisqartiramiz (clamp).
    MAX_SHIFT_HOURS = Decimal("16")

    def __init__(
        self,
        repo: SalaryHistoryRepository = Depends(),
        employee_repo: EmployeeRepository = Depends(),
        leader_repo: LeaderRepository = Depends(),
        attendance_repo: AttendanceRepository = Depends(),
        adj_repo: SalaryAdjustmentRepository = Depends(),
        leave_repo: LeaveRequestRepository = Depends(),
        notif: NotificationService = Depends(),
    ):
        self.repo = repo
        self.employee_repo = employee_repo
        self.leader_repo = leader_repo
        self.attendance_repo = attendance_repo
        self.adj_repo = adj_repo
        self.leave_repo = leave_repo
        self.notif = notif
        # Oylik hisoblashdan oldin o'sha oyning kelmagan kunlarini avto-to'ldirish uchun
        self.backfill = AttendanceBackfillService(
            attendance_repo=attendance_repo,
            employee_repo=employee_repo,
            leave_repo=leave_repo,
        )

    # ---------- AVANS / PREMIYA (itemized) ----------

    async def _recompute_month(self, employee_id: UUID, month: date) -> None:
        """O'sha oyning oyligi (agar bor va to'lanmagan bo'lsa) avans/premiya
        yig'indisiga ko'ra ATOMIK qayta hisoblanadi: final = max(0, base + (premiya - avans)).

        Atomik shartli UPDATE (recompute_if_unpaid) ishlatamiz:
        - to'langan oylik ustiga yozilmaydi (is_paid IS FALSE sharti) — lost-update poygasi yo'q;
        - final_salary 0 dan past tushmaydi (GREATEST(0, ...)) — manfiy oylik bo'lmaydi."""
        advance, bonus = await self.adj_repo.sums_for_month(employee_id, month)
        net = bonus - advance
        await self.repo.recompute_if_unpaid(employee_id=employee_id, month=month, net=net)

    async def give_adjustment(self, user_id: UUID, data: SalaryAdjustmentCreate) -> SalaryAdjustmentInfo:
        """Avans yoki premiya beradi — OYLIK HISOBLANMASA HAM (alohida yozuv)."""
        employee = await verify_leader_owns_employee(
            self.leader_repo, self.employee_repo, user_id=user_id, employee_id=data.employee_id
        )
        month_date = date(data.year, data.month, 1)

        # To'langan oylikka avans/premiya berib bo'lmaydi
        existing = await self.repo.get_by_employee_and_month(
            employee_id=employee.id, year=data.year, month=data.month
        )
        if existing and existing.is_paid:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bu oy oyligi to'langan — avans/premiya berib bo'lmaydi !",
            )

        adj = await self.adj_repo.create(SalaryAdjustment(
            employee_id=employee.id,
            type=data.type,
            amount=data.amount,
            note=data.note,
            month=month_date,
            given_by=user_id,
        ))

        # Agar shu oy oyligi allaqachon hisoblangan (va to'lanmagan) bo'lsa — yangilaymiz.
        # recompute_if_unpaid atomik: to'langan bo'lsa 0 qaytaradi va hech narsa o'zgarmaydi.
        advance, bonus = await self.adj_repo.sums_for_month(employee.id, month_date)
        updated = await self.repo.recompute_if_unpaid(
            employee_id=employee.id, month=month_date, net=bonus - advance
        )
        # TOCTOU himoyasi: agar oylik mavjud-u, lekin recompute 0 qaytargan bo'lsa
        # (ya'ni oraga to'lov tushib, oylik to'langan bo'lib qolgan) — yangi avansni
        # bekor qilamiz, aks holda u "berilgan" ko'rinadi-yu, oylikdan ushlanmaydi.
        if updated == 0:
            refreshed = await self.repo.get_by_employee_and_month(
                employee_id=employee.id, year=data.year, month=data.month
            )
            if refreshed and refreshed.is_paid:
                await self.adj_repo.delete(adj)
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Bu oy oyligi to'langan — avans/premiya berib bo'lmaydi !",
                )

        # Xodimga bildirishnoma (xato bo'lsa amalni buzmasin)
        try:
            label = f"{data.month:02d}.{data.year}"
            if data.type == "bonus":
                title, body = "Premiya berildi 🎁", f"+{_money(data.amount)} so'm premiya ({label})"
            else:
                title, body = "Avans berildi", f"{_money(data.amount)} so'm avans ({label})"
            await self.notif.notify(employee.user_id, title=title, body=body, type="salary", link="/")
        except Exception:  # noqa: BLE001
            logger.exception("Avans/premiya notify xatosi")

        return SalaryAdjustmentInfo.model_validate(adj)

    async def list_adjustments(self, user_id: UUID, employee_id: UUID, year: int, month: int) -> list[SalaryAdjustmentInfo]:
        """Rahbar: bitta xodimning oy bo'yicha avans/premiya ro'yxati."""
        employee = await verify_leader_owns_employee(
            self.leader_repo, self.employee_repo, user_id=user_id, employee_id=employee_id
        )
        items = await self.adj_repo.list_by_employee_month(employee.id, date(year, month, 1))
        return [SalaryAdjustmentInfo.model_validate(i) for i in items]

    async def my_adjustments(self, user_id: UUID, limit: int = 100) -> list[SalaryAdjustmentInfo]:
        """Xodim: o'zining avans/premiya tarixi."""
        employee = await get_current_employee(self.employee_repo, user_id)
        items = await self.adj_repo.list_by_employee(employee.id, limit)
        return [SalaryAdjustmentInfo.model_validate(i) for i in items]

    async def list_team_adjustments(self, user_id: UUID, year: int, month: int) -> list[SalaryAdjustmentWithEmployee]:
        """Rahbar: BARCHA xodimlarning shu oydagi avans/premiyalari (sahifada ko'rinadi)."""
        leader = await self.leader_repo.get_by_user_id(user_id)
        if not leader:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Siz rahbar emasiz !")
        items = await self.adj_repo.list_for_leader_month(leader.id, date(year, month, 1))
        out: list[SalaryAdjustmentWithEmployee] = []
        for a in items:
            u = a.employee.user if a.employee else None
            name = (f"{u.first_name or ''} {u.last_name or ''}".strip() or u.username) if u else "Xodim"
            out.append(SalaryAdjustmentWithEmployee(
                id=a.id, employee_id=a.employee_id, type=a.type, amount=a.amount,
                note=a.note, month=a.month, created_at=a.created_at, employee_name=name,
            ))
        return out

    async def paid(self, employee_id: UUID, user_id: UUID, salary_id: UUID) -> SalaryHistoryInfo:
        employee = await verify_leader_owns_employee(
            self.leader_repo, self.employee_repo, user_id=user_id, employee_id=employee_id
        )
        salary = await self.repo.get_by_id(salary_id)

        if not salary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Oylik topilmadi !"
            )

        if salary.employee_id != employee.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bu oylik bu xodimga tegishli emas !"
            )

        # Atomik, idempotent to'lov: faqat hali to'lanmagan bo'lsa belgilanadi.
        # Bir vaqtda/qayta yuborilgan so'rovda ikki marta to'lash (race) oldini oladi.
        paid_at = now_utc()
        updated_rows = await self.repo.mark_paid(salary.id, paid_at)
        if updated_rows == 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Oylik allaqachon to'langan !"
            )

        # Core update sessiyadagi obyekt atributlarini expire qiladi — DB'dan qayta
        # yuklab olamiz (aks holda lazy-load sync validatsiyada xato beradi).
        await self.repo.database.refresh(salary)

        # Xodimga "oylik to'landi" bildirishnomasi (xato bo'lsa to'lovni buzmasin)
        try:
            await self.notif.notify(
                employee.user_id,
                title="Oylik to'landi 💰",
                body=f"{_money(salary.final_salary)} so'm oyligingiz to'landi",
                type="salary",
                link="/",
            )
        except Exception:  # noqa: BLE001
            logger.exception("Oylik to'landi notify xatosi")

        return SalaryHistoryInfo.model_validate(salary)

    async def adjust_salary(self, user_id: UUID, salary_id: UUID, bonus: Decimal, note: str | None = None) -> SalaryHistoryInfo:
        """Eski endpoint (salary_id + ishorali bonus). Endi ITEMLI tizimga delegat qiladi:
        musbat -> premiya, manfiy -> avans. Yangi yozuv yaratiladi + oylik qayta hisoblanadi."""
        salary = await self.repo.get_by_id(salary_id)

        if not salary:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oylik topilmadi !")

        employee = await verify_leader_owns_employee(
            self.leader_repo, self.employee_repo, user_id=user_id, employee_id=salary.employee_id
        )

        if salary.is_paid:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="To'langan oylikni o'zgartirib bo'lmaydi !"
            )

        # Numeric(10,2) overflow oldini olish — summa chegaradan oshmasligi kerak.
        if abs(bonus) > Decimal("99999999.99"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Summa juda katta !"
            )

        # Ishorali bonus -> alohida itemli yozuv (manfiy = avans, musbat = premiya)
        if bonus != 0:
            await self.adj_repo.create(SalaryAdjustment(
                employee_id=salary.employee_id,
                type=("bonus" if bonus > 0 else "advance"),
                amount=abs(bonus),
                note=note,
                month=salary.month,
                given_by=user_id,
            ))

        # final_salary = base + (premiya - avans) — qayta hisoblaymiz
        await self._recompute_month(salary.employee_id, salary.month)
        await self.repo.database.refresh(salary)

        try:
            if bonus >= 0:
                title, body = "Premiya berildi 🎁", f"+{_money(bonus)} so'm premiya oylikingizga qo'shildi"
            else:
                title, body = "Avans berildi", f"{_money(-bonus)} so'm avans oylikingizdan ayirildi"
            await self.notif.notify(employee.user_id, title=title, body=body, type="salary", link="/")
        except Exception:  # noqa: BLE001
            logger.exception("Oylik o'zgartirish notify xatosi")

        return SalaryHistoryInfo.model_validate(salary)

    async def get_salary_summary(self, user_id: UUID, year: int, month: int) -> SalarySummary:
        leader = await self.leader_repo.get_by_user_id(user_id)
        if not leader:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Siz rahbar emasiz !"
            )

        data = await self.repo.get_summary_for_leader(leader.id, year, month)
        return SalarySummary(**data)

    async def get_my_salary_history(self, user_id: UUID, limit: int, offset: int) -> list[SalaryHistoryInfo]:
        employee = await get_current_employee(self.employee_repo, user_id)

        salaries = await self.repo.get_by_employee(employee_id=employee.id, limit=limit, offset=offset)

        return [SalaryHistoryInfo.model_validate(s) for s in salaries]

    async def get_employee_salary(self, user_id: UUID, employee_id: UUID, limit: int, offset: int) -> list[SalaryHistoryInfo]:
        employee = await verify_leader_owns_employee(
            self.leader_repo, self.employee_repo, user_id=user_id, employee_id=employee_id
        )
        salaries = await self.repo.get_by_employee(employee_id=employee.id, limit=limit, offset=offset)

        return [SalaryHistoryInfo.model_validate(s) for s in salaries]

    async def calculate_salary(self, user_id: UUID, employee_id: UUID, year: int, month: int) -> SalaryHistoryInfo:
        employee = await verify_leader_owns_employee(
            self.leader_repo, self.employee_repo, user_id=user_id, employee_id=employee_id
        )

        # Oylik faqat oy TUGAGACH hisoblanadi (joriy yoki kelajak oy → xato)
        next_month = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
        if today_local() < next_month:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Oy hali tugamagan — oylik faqat oy tugagach hisoblanadi !"
            )

        # Lazy catch-up: server o'chiq bo'lib o'tkazib yuborilgan kunlar bo'lishi mumkin —
        # oylik hisoblashdan oldin o'sha oyning kelmagan kunlarini avto-to'ldiramiz
        # (absent/leave). Allaqachon yozuvi bor kunlarga tegmaydi.
        try:
            month_end = next_month - timedelta(days=1)
            await self.backfill.backfill_range(date(year, month, 1), month_end)
        except Exception:  # noqa: BLE001
            logger.exception("Oylik oldidan davomat backfill xatosi (hisoblash davom etadi)")

        attendance = await self.attendance_repo.get_for_month(employee_id=employee.id, year=year, month=month)
        salary = await self.repo.get_by_employee_and_month(employee_id=employee.id, year=year, month=month)

        if salary:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bu oy uchun oylik allaqachon hisoblangan !"
            )

        # Pulni Decimal'da hisoblaymiz (float yaxlitlash xatosisiz):
        # har bir yozuv soatini butun soniyalardan Decimal sifatida olamiz.
        # HAR BIR smena MAX_SHIFT_HOURS bilan cheklanadi — chiqishni unutib, bir necha
        # kun "ochiq" qolgan smena 100+ soatga aylanib, ortiqcha pul to'lashiga yo'l qo'ymaymiz.
        worked_hours = Decimal("0")
        for att in attendance:
            if att.check_in and att.check_out:
                seconds = int((att.check_out - att.check_in).total_seconds())
                shift_hours = Decimal(seconds) / Decimal(3600)
                worked_hours += min(shift_hours, self.MAX_SHIFT_HOURS)

        # worked_days — TAKRORLANMAS ish kunlari (bir kunda 2 marta check-in/out
        # bo'lsa ham bitta kun sifatida sanaladi).
        worked_days = len({att.work_date for att in attendance if att.check_out is not None})

        excused = [att for att in attendance if att.status == AttendanceStatus.reason]
        excused_days = min(len(excused), self.MAX_EXCUSED_DAYS)
        # O'rtacha kunlik soat ham MAX_SHIFT_HOURS bilan cheklanadi — bitta anomal
        # uzun smena o'rtachani shishirib, sababli kunlar to'lovini ham oshirib yubormasin.
        avg_daily_hours = (worked_hours / worked_days) if worked_days else Decimal("0")
        avg_daily_hours = min(avg_daily_hours, self.MAX_SHIFT_HOURS)
        excused_hours = avg_daily_hours * excused_days

        total_hours = (worked_hours + excused_hours).quantize(Decimal("0.01"))
        base_salary = (total_hours * employee.hourly_rate).quantize(Decimal("0.01"))
        days_worked = worked_days + excused_days

        # Shu oyga oldindan berilgan avans/premiyalarni qo'llaymiz:
        # net = premiya - avans;  final = max(0, base + net).
        # max(0, ...) — avans bazadan oshib ketsa ham oylik manfiy bo'lmaydi (clamp).
        # Manfiy oylik xodimga "−1 000 000 to'landi" degan bema'ni bildirishnoma yuborardi
        # va kompaniya qarzi izsiz yo'qolardi. Ortib qolgan avans kelajakda alohida
        # boshqariladi (hozircha 0 ga clamp qilamiz).
        advance, bonus = await self.adj_repo.sums_for_month(employee.id, date(year, month, 1))
        net = bonus - advance
        final_salary = max(Decimal("0"), base_salary + net)

        created = SalaryHistory(
            employee_id=employee_id,
            total_hours=total_hours,
            month=date(year, month, 1),
            base_salary=base_salary,
            final_salary=final_salary,
            bonus=net,
            days_worked=days_worked,
        )

        try:
            await self.repo.create(created)
            try:
                await self.notif.notify(
                    employee.user_id,
                    title="Oylik hisoblandi 💰",
                    body=f"{_money(final_salary)} so'm oyligingiz to'landi",
                    type="salary",
                    link="/",
                )
            except Exception:  # noqa: BLE001
                logger.exception("Oylik to'landi notify xatosi")
        except IntegrityError:
            # Bir vaqtda bir oy uchun ikkinchi hisoblash (unique constraint) — 409.
            await self.repo.database.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bu oy uchun oylik allaqachon hisoblangan !"
            )
        return SalaryHistoryInfo.model_validate(created)

    async def get_salarys_list(self, user_id: UUID, year: int, month: int,  limit: int, offset: int) -> list[SalaryWithEmployeeInfo]:
        leader = await self.leader_repo.get_by_user_id(user_id=user_id)
        
        if not leader:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Siz rahbar emasiz !"
            )
            
        salaries = await self.repo.get_salarys(leader_id=leader.id, year=year, month=month,  limit=limit, offset=offset)
        
        return [SalaryWithEmployeeInfo.model_validate(s) for s in salaries]
    
    
    async def get_salary_trend(self, user_id: UUID) -> list[SalaryTrendItem]:
        leader = await self.leader_repo.get_by_user_id(user_id=user_id)
        
        if not leader:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Siz rahbar emasiz !"
            )
        
        today = today_local()
        total = (today.year * 12 + today.month - 1) - 12
        start_month = date(total // 12, total % 12 + 1, 1)
        
        rows = await self.repo.get_salary_trend_for_leader(leader_id=leader.id, start_month=start_month)
        return [SalaryTrendItem(month=r.month, total=r.total) for r in rows]
    