import logging
import math
from datetime import date, datetime, time, timedelta, timezone
from uuid import UUID

from fastapi import Depends, HTTPException, status
from decimal import Decimal
from sqlalchemy.exc import IntegrityError

from app.core.timezone import now_utc, to_local, today_local
from app.enum.attendance_status import AttendanceStatus
from app.helper.geo import distance_meters
from app.helper.get_current_employee import get_current_employee
from app.helper.verify_leader_owns_employee import verify_leader_owns_employee
from app.model.attendance import Attendance
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.branch_repository import BranchRepository
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.leader_repository import LeaderRepository
from app.repositories.user_repository import UserRepository
from app.schemas.attendance import AttendanceInfo, AttendanceUpdate, ScanRequest, AttendanceListResponse, AttendanceTrendItem, WeeklyAttendanceItem, AttendanceReportRow
from app.services.notification_services import NotificationService
from app.model.employee import Employee
from app.helper.worked_hours import worked_hours

logger = logging.getLogger("app.attendance")


class AttendanceService:
    MAX_DAILY_ATTENDANCE = 1
    # Rahbar davomatni qo'lda tahrirlaganda bitta smena shu chegaradan oshmasligi kerak —
    # check_in=2020, check_out=hozir kabi tahrir yuz minglab soat = cheksiz pul yaratardi.
    MAX_SHIFT_HOURS = 16
    # Bir smena tugagach (check_out), yangi check-in uchun minimal dam olish oynasi.
    # Kunlik limit kalendar kuniga bog'liq edi — yarim tunni kesib o'tgan smena 00:05'da
    # chiqib darhol qayta kirsa, yangi kun count=0 bo'lib ikkinchi to'lovga yo'l ochilardi.
    # Bu oyna (kalendardan mustaqil) shu teshikni yopadi.
    MIN_REST_HOURS = 6

    def __init__(
        self,
        repo: AttendanceRepository = Depends(),
        leader_repo: LeaderRepository = Depends(),
        employee_repo: EmployeeRepository = Depends(),
        branch_repo: BranchRepository = Depends(),
        user_repo: UserRepository = Depends(),
        notif: NotificationService = Depends(),
    ):
        self.repo = repo
        self.leader_repo = leader_repo
        self.employee_repo = employee_repo
        self.branch_repo = branch_repo
        self.user_repo = user_repo
        self.notif = notif

    DEFAULT_SHIFT_LEN = timedelta(hours=12)

    @classmethod
    def _is_late(cls, shift_start: time | None, shift_end: time | None, local_now: datetime) -> bool:
        if shift_start is None:
            return False

        start_min = shift_start.hour * 60 + shift_start.minute
        now_min = local_now.hour * 60 + local_now.minute

        # Smena oxiri (daqiqada). Tun aylansa (end <= start) +24h.
        if shift_end is not None:
            end_min = shift_end.hour * 60 + shift_end.minute
            if end_min <= start_min:
                end_min += 24 * 60
        else:
            end_min = start_min + cls.DEFAULT_SHIFT_LEN.total_seconds() / 60

        # check-in shift_start'dan "oldin" ko'rinsa, tun aylanishini hisobga olib +24h.
        if now_min < start_min:
            now_min += 24 * 60

        # Smena oynasidan keyin (ancha kech) -> bu boshqa kun, kechikish emas.
        if now_min > end_min:
            return False

        return now_min > start_min

    async def _employee_name(self, employee) -> str:
        """Xodimning o'qiladigan ismi (User'dan; xato bo'lsa 'Xodim')."""
        try:
            u = await self.user_repo.get_user_by_id(employee.user_id)
            if u:
                full = f"{u.first_name or ''} {u.last_name or ''}".strip()
                return full or u.username
        except Exception:  # noqa: BLE001
            pass
        return "Xodim"

    def _build_info(self, attendance, employee) -> AttendanceInfo:
        info = AttendanceInfo.model_validate(attendance)

        hours = worked_hours(info)
        
        info.duration_hours = round(hours, 2)
        info.earned_amount = (
            Decimal(str(hours)) * employee.hourly_rate
        ).quantize(Decimal("0.01"))
        
     
        return info

    async def _build_list(self, employee, limit: int, offset: int, year: int | None, month: int | None) -> AttendanceListResponse:
        if year and month:
            attendances = await self.repo.get_for_month(employee_id=employee.id, year=year, month=month)
            total = len(attendances)
        else:
            attendances = await self.repo.get_by_employee(employee_id=employee.id, limit=limit, offset=offset)
            total = await self.repo.count_by_employee(employee_id=employee.id)

        items = [self._build_info(att, employee) for att in attendances]

        return AttendanceListResponse(
            items=items,
            total=total,
            limit=limit,
            offset=offset
        )

    async def _get_leader(self, user_id: UUID):
        leader = await self.leader_repo.get_by_user_id(user_id)

        if not leader:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Siz rahbar emasiz !")

        return leader

    async def _get_active_attendance(self, employee_id: UUID, method: str = "check-in", *, for_update: bool = False) -> Attendance:
        # Ochiq yozuvni KUNGA bog'lamay topamiz (yarim tunni kesgan smena ham
        # check-out qilinsin, va ochiq yozuv borligida qayta check-in bo'lmasin).
        # for_update=True (check-out yo'lida): qatorni qulflab o'qiymiz, shunda
        # ikki bir vaqtdagi check-out so'rovidan faqat bittasi yopadi (3.2 race fix).
        attendance_active = await self.repo.get_open(employee_id=employee_id, for_update=for_update)

        if method == "check-in":
            if attendance_active:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Siz allaqachon check-in qilgansiz. Avval check-out qiling."
                )
        elif method == "check-out":
            if not attendance_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Avval check-in qiling !"
                )

        return attendance_active

    async def _verify_location(self, employee: Employee, data: ScanRequest):
        # Xodimga filial biriktirilganmi?
        if employee.branch_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sizga filial biriktirilmagan — administratorga murojaat qiling !"
            )

        branch = await self.branch_repo.get_by_id(data.branch_id)
        if not branch or not branch.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Filial topilmadi yoki faol emas !"
            )

        # QR'dagi filial xodimnikiga mosmi?
        if employee.branch_id != branch.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu QR boshqa filialniki !"
            )

        # Koordinatalar chekli (finite) va to'g'ri diapazonda bo'lishi shart —
        # NaN/Infinity bilan geo-fence'ni chetlab o'tishning oldini olamiz.
        if (
            not math.isfinite(data.latitude) or not math.isfinite(data.longitude)
            or not (-90 <= data.latitude <= 90) or not (-180 <= data.longitude <= 180)
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Koordinatalar noto'g'ri !"
            )

        # GPS magazin radiusida-mi?
        dist = distance_meters(data.latitude, data.longitude, branch.latitude, branch.longitude)
        # Qo'shimcha himoya: masofa chekli son bo'lmasa (NaN/inf) — rad etamiz.
        if not math.isfinite(dist) or dist > branch.radius_meters:
            await self.notif.notify(
                employee.leader.user_id, title=f"{employee.user.first_name} boshqa manzildan QR code qilishga urindi !",
                body=f"uzoqlik: {int(dist) if math.isfinite(dist) else '∞'}m !",
                type="attendance", link="/",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Siz magazinda emassiz (uzoqlik: {int(dist) if math.isfinite(dist) else '∞'}m) !"
            )

   
    async def get_my_attendance(self, user_id: UUID, limit: int, offset: int, year: int | None, month: int | None) -> AttendanceListResponse:
        employee = await get_current_employee(self.employee_repo, user_id)

        return await self._build_list(employee, limit, offset, year, month)

    async def get_employee_attendance(self, user_id: UUID, employee_id: UUID, limit: int, offset: int, year: int | None, month: int | None) -> AttendanceListResponse:
        employee = await verify_leader_owns_employee(
            self.leader_repo, self.employee_repo, user_id=user_id, employee_id=employee_id
        )

        return await self._build_list(employee, limit, offset, year, month)

    async def get_today_team(self, user_id: UUID, work_date: date | None = None) -> list[AttendanceInfo]:
        leader = await self._get_leader(user_id)

        if work_date is None:
            work_date = today_local()

        attendances = await self.repo.get_for_team(leader_id=leader.id, work_date=work_date)

        return [self._build_info(att, att.employee) for att in attendances]

    async def get_attendance_trend(self, user_id: UUID, start_date: date | None, end_date: date | None) -> list[AttendanceTrendItem]:
        leader = await self._get_leader(user_id)

        if end_date is None:
            end_date = today_local()
        if start_date is None:
            start_date = end_date.replace(day=1)

        rows = await self.repo.get_daily_trend_for_leader(leader.id, start_date, end_date)
        return [
            AttendanceTrendItem(date=r.date, present=r.present, late=r.late, absent=r.absent)
            for r in rows
        ]

    async def get_my_weekly(self, user_id: UUID, year: int | None, month: int | None) -> list[WeeklyAttendanceItem]:
        employee = await get_current_employee(self.employee_repo, user_id)

        today = today_local()
        year = year or today.year
        month = month or today.month

        records = await self.repo.get_for_month(employee_id=employee.id, year=year, month=month)

        hours_by_week: dict[int, Decimal] = {}
        days_by_week: dict[int, int] = {}

        for record in records:
            week = (record.work_date.day - 1) // 7 + 1   # W1:1-7, W2:8-14, W3:15-21, W4:22+
            if week > 4:
                week = 4                            # W5 (29-31) → W4 ga qo'shamiz

            if record.check_in and record.check_out:
                hours = worked_hours(record)
                hours_by_week[week] = hours_by_week.get(week, Decimal("0")) + hours
                days_by_week[week] = days_by_week.get(week, 0) + 1

        return [
            WeeklyAttendanceItem(
                week=f"W{w}",
                hours=round(hours_by_week.get(w, Decimal("0")), 1),
                days=days_by_week.get(w, 0),
            )
            for w in range(1, 5)
        ]
    
    async def attendance_report(self, user_id: UUID, year: int, month: int) -> list[AttendanceReportRow]:
        """Rahbar: oylik davomat hisoboti — har xodim bo'yicha kelgan/kechikkan/jami."""
        leader = await self._get_leader(user_id)
        employees = await self.employee_repo.get_by_leader_id(leader.id)
        stats = await self.repo.get_month_stats([e.id for e in employees], year, month)
        rows: list[AttendanceReportRow] = []
        for e in employees:
            u = e.user
            name = (f"{u.first_name or ''} {u.last_name or ''}".strip() or u.username) if u else "Xodim"
            s = stats.get(e.id)
            present = int(s.present) if s else 0
            on_time = int(s.on_time) if s else 0
            total = int(s.total) if s else 0
            rows.append(AttendanceReportRow(
                employee_id=e.id,
                employee_name=name,
                present=present,
                late=present - on_time,
                on_time=on_time,
                total=total,
            ))
        return rows

    async def check_in(self, user_id: UUID, data: ScanRequest) -> AttendanceInfo:
        employee = await get_current_employee(self.employee_repo, user_id)

        await self._verify_location(employee, data)
        await self._get_active_attendance(employee_id=employee.id, method="check-in")

        count_attendance = await self.repo.get_today_attended_count(employee_id=employee.id)

        if count_attendance >= self.MAX_DAILY_ATTENDANCE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bugungi check-in/check-out limiti tugadi !"
            )

        now = now_utc()

        # Yarim tunni kesib o'tuvchi smena himoyasi: oxirgi check-out'dan beri yetarli
        # dam o'tmagan bo'lsa, yangi smenani bloklaymiz. Bu kunlik (work_date) limit
        # chetlab o'tilganda ham ikkinchi to'lov smenasi ochilishiga yo'l qo'ymaydi.
        last = await self.repo.get_last_checkout(employee_id=employee.id)
        if last and last.check_out and (now - last.check_out) < timedelta(hours=self.MIN_REST_HOURS):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Yangi smena uchun oxirgi chiqishdan keyin kamida {self.MIN_REST_HOURS} soat o'tishi kerak !"
            )
        # Kechikishni MAHALLIY vaqtda aniqlaymiz (UTC bilan solishtirish noto'g'ri edi).
        # _is_late yarim tunni kesuvchi smenani ham to'g'ri hisoblaydi.
        local_now = to_local(now)
        is_late = self._is_late(employee.shift_start, employee.shift_end, local_now)
        attendance_status = AttendanceStatus.late if is_late else AttendanceStatus.came

        # Avto-job bugun absent/leave yozib qo'ygan bo'lsa — YANGI yozuv yaratish
        # o'rniga shu placeholder'ni qayta ishlatamiz (bir kunda ikki yozuv qolmasin).
        # for_update=True: placeholder qatorini QULFLAB o'qiymiz, shunda ikki bir
        # vaqtdagi check-in undagi check_in'ni birin-ketin emas, navbat bilan yozadi
        # -> birinchisining vaqti/notes jimgina yo'qolmaydi (3.1 race fix).
        placeholder = await self.repo.get_today_placeholder(employee_id=employee.id, for_update=True)

        try:
            if placeholder is not None:
                placeholder.check_in = now
                placeholder.check_out = None
                placeholder.status = attendance_status
                placeholder.is_late = is_late
                if data.notes:
                    placeholder.notes = data.notes
                created = await self.repo.update(placeholder)
            else:
                new_attendance = Attendance(
                    employee_id=employee.id,
                    work_date=today_local(),
                    check_in=now,
                    check_out=None,
                    status=attendance_status,
                    is_late=is_late,
                    notes=data.notes
                )
                created = await self.repo.create(new_attendance)
        except IntegrityError:
            # Bir vaqtda ikkinchi check-in (race) — partial unique index ushladi.
            await self.repo.database.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Siz allaqachon check-in qilgansiz. Avval check-out qiling."
            )

        # Bildirishnoma (xato bo'lsa check-in'ni buzmasin)
        try:
            local_t = to_local(created.check_in).strftime("%H:%M")
            if is_late:
                await self.notif.notify(
                    employee.user_id, title="Kechikib keldingiz ⏰",
                    body=f"Bugun {local_t} da check-in qildingiz (kechikish belgilandi)",
                    type="attendance", link="/",
                )
                # Rahbarга ham xabar — kim kechikkanini bilsin
                leader = await self.leader_repo.get_by_id(employee.leader_id)
                if leader:
                    name = await self._employee_name(employee)
                    await self.notif.notify(
                        leader.user_id, title="Xodim kechikdi ⏰",
                        body=f"{name} bugun {local_t} da kechikib keldi",
                        type="attendance", link="/",
                    )
            else:
                await self.notif.notify(
                    employee.user_id, title="Ishga keldingiz ✅",
                    body=f"Bugun {local_t} da check-in muvaffaqiyatli",
                    type="attendance", link="/",
                )
        except Exception:  # noqa: BLE001
            logger.exception("Check-in notify xatosi")

        return self._build_info(created, employee)

    async def check_out(self, user_id: UUID, data: ScanRequest) -> AttendanceInfo:
        employee = await get_current_employee(self.employee_repo, user_id)

        await self._verify_location(employee, data)
        # for_update=True: ochiq smenani QULFLAB o'qiymiz. Ikki bir vaqtdagi check-out
        # kelganda ikkinchisi birinchisi commit qilguncha kutadi, so'ng get_open None
        # qaytaradi (check_out endi to'ldirilgan) -> 400 "Avval check-in qiling" oladi,
        # ya'ni ikki marta yopilmaydi va ikkita notif chiqmaydi (3.2 race fix).
        attendance_active = await self._get_active_attendance(employee_id=employee.id, method="check-out", for_update=True)

        attendance_active.check_out = now_utc()
        attendance_active.status = AttendanceStatus.left
        # is_late (kelishdagi kechikish) o'zgartirilmaydi — reyting uchun saqlanadi.

        if data.notes:
            attendance_active.notes = data.notes

        updated = await self.repo.update(attendance_active)

        # Bildirishnoma (xato bo'lsa check-out'ni buzmasin)
        try:
            local_t = to_local(updated.check_out).strftime("%H:%M")
            await self.notif.notify(
                employee.user_id, title="Ish kuningiz yakunlandi 👋",
                body=f"Bugun {local_t} da check-out qildingiz",
                type="attendance", link="/",
            )
        except Exception:  # noqa: BLE001
            logger.exception("Check-out notify xatosi")

        return self._build_info(updated, employee)

    async def scan(self, user_id: UUID, data: ScanRequest) -> AttendanceInfo:
        employee = await get_current_employee(self.employee_repo, user_id)
        # Bu yerda lock SHART EMAS — get_open faqat YO'NALTIRISH uchun (check-in
        # yoki check-out?). Haqiqiy qulflash check_in()/check_out() ichida bo'ladi.
        active = await self.repo.get_open(employee_id=employee.id)

        if active is not None:
            return await self.check_out(user_id=user_id, data=data)

        today_count = await self.repo.get_today_attended_count(employee_id=employee.id)

        if today_count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bugun ish kuningiz allaqachon tugagan (keldi va ketdi belgilangan) !"
            )

        return await self.check_in(user_id=user_id, data=data)

    async def nfc(self, nfc_uid: str) -> AttendanceInfo:
        employee = await self.employee_repo.get_by_nfc_uid(nfc_uid=nfc_uid)

        if employee is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Bu NFC karta hech kimga biriktirilmagan!")

        now = now_utc()
        local_now = to_local(now)

        # for_update=True: ochiq smenani qulflab o'qiymiz — ikki bir vaqtdagi NFC tap
        # check-out poygasidan faqat bittasi yopadi (3.2 race fix, scan bilan bir xil).
        active = await self.repo.get_open(employee_id=employee.id, for_update=True)
        if active is not None:
            active.check_out = now
            active.status = AttendanceStatus.left
            updated = await self.repo.update(active)
            try:
                local_t = local_now.strftime("%H:%M")
                await self.notif.notify(
                    employee.user_id, title="Ishdan ketdingiz ✅",
                    body=f"Bugun {local_t} da check-out muvaffaqiyatli",
                    type="attendance", link="/",
                )
            except Exception:
                logger.exception("NFC check-out notify xatosi")
            return self._build_info(updated, employee)

        today_count = await self.repo.get_today_attended_count(employee_id=employee.id)
        if today_count >= self.MAX_DAILY_ATTENDANCE:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bugun ish kuningiz allaqachon tugagan!"
            )

        is_late = self._is_late(employee.shift_start, employee.shift_end, local_now)
        attendance_status = AttendanceStatus.late if is_late else AttendanceStatus.came

        # for_update=True: placeholder'ni qulflab o'qiymiz (3.1 race fix, scan bilan bir xil).
        placeholder = await self.repo.get_today_placeholder(employee_id=employee.id, for_update=True)
        try:
            if placeholder is not None:
                placeholder.check_in = now
                placeholder.check_out = None
                placeholder.status = attendance_status
                placeholder.is_late = is_late
                created = await self.repo.update(placeholder)
            else:
                new_attendance = Attendance(
                    employee_id=employee.id,
                    work_date=today_local(),
                    check_in=now,
                    check_out=None,
                    status=attendance_status,
                    is_late=is_late,
                )
                created = await self.repo.create(new_attendance)
        except IntegrityError:
            await self.repo.database.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Siz allaqachon check-in qilgansiz."
            )

        try:
            local_t = local_now.strftime("%H:%M")
            if is_late:
                await self.notif.notify(
                    employee.user_id, title="Kechikib keldingiz ⏰",
                    body=f"Bugun {local_t} da check-in qildingiz (kechikish belgilandi)",
                    type="attendance", link="/",
                )
                leader = await self.leader_repo.get_by_id(employee.leader_id)
                if leader:
                    name = await self._employee_name(employee)
                    await self.notif.notify(
                        leader.user_id, title="Xodim kechikdi ⏰",
                        body=f"{name} bugun {local_t} da kechikib keldi",
                        type="attendance", link="/",
                    )
            else:
                await self.notif.notify(
                    employee.user_id, title="Ishga keldingiz ✅",
                    body=f"Bugun {local_t} da check-in muvaffaqiyatli",
                    type="attendance", link="/",
                )
        except Exception:
            logger.exception("NFC check-in notify xatosi")

        return self._build_info(created, employee)
        
    
    
    async def update(self, data: AttendanceUpdate, attendance_id: UUID, user_id: UUID) -> AttendanceInfo:
        leader = await self._get_leader(user_id)

        attendance = await self.repo.get_by_id(attendance_id)
        if not attendance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Davomat yozuvi topilmadi !"
            )

        employee = await self.employee_repo.get_by_id(attendance.employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Xodim topilmadi !"
            )

        if employee.leader_id != leader.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu xodim sizga tegishli emas !"
            )

        update_fields = data.model_dump(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(attendance, field, value)
            
        # "Ochiq" (check_out IS NULL) faqat HAQIQIY smena uchun ruxsat etiladi:
        # ya'ni status keldi/kechikdi bo'lsa. absent/leave/reason/left holatlari
        # check_out'siz ochiq smena bo'la olmaydi — ular DB unique-indeksining
        # "bitta ochiq slot"ini band qilib, keyingi check-in'larni bloklab qo'yadi.
        # DIQQAT: bu yerda `status`ni tekshiramiz (avval xato bilan `check_out`
        # (datetime) enum bilan solishtirilardi — har doim True bo'lib, qonuniy
        # tahrirlarni ham rad etardi).
        if attendance.status in (AttendanceStatus.absent, AttendanceStatus.leave) and (
            attendance.check_in or attendance.check_out
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Kelmagan yoki ta'tildagi kunga kirish/chiqish vaqtini qo'shib bo'lmaydi !",
            )

        # Yakuniy holatda check_out check_in'dan oldin bo'lib qolmasligini tekshiramiz
        # (qisman update natijasida ham manfiy davomiylik/pul chiqmasin).
        if attendance.check_in and attendance.check_out and attendance.check_out < attendance.check_in:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="check_out check_in'dan oldin bo'lishi mumkin emas !"
            )

        # Vaqtlar kelajakda bo'lmasligi kerak — aks holda hali sodir bo'lmagan ish
        # uchun pul to'lanardi. Kichik 5 daqiqalik soat farqi (clock skew) uchun bo'sh joy.
        now = now_utc()
        skew = timedelta(minutes=5)
        for label, ts in (("check_in", attendance.check_in), ("check_out", attendance.check_out)):
            if ts and ts > now + skew:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"{label} kelajakdagi vaqt bo'lishi mumkin emas !"
                )

        # Bitta smena MAX_SHIFT_HOURS dan oshmasligi kerak — uzoq oraliqdagi
        # tahrir (masalan check_in=o'tgan yil) yuz minglab soatga aylanib, ortiqcha
        # pul to'lashga olib kelardi.
        if attendance.check_in and attendance.check_out:
            duration_hours = (attendance.check_out - attendance.check_in).total_seconds() / 3600
            if duration_hours > self.MAX_SHIFT_HOURS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Smena davomiyligi {self.MAX_SHIFT_HOURS} soatdan oshmasligi kerak !"
                )

        updated = await self.repo.update(attendance)
        return self._build_info(updated, employee)

    