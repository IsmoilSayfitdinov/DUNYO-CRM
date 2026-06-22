from datetime import date, timedelta
from uuid import UUID

from sqlalchemy import extract, func, select
from sqlalchemy.orm import selectinload

from app.core.timezone import today_local
from app.db.database import SessionsDep
from app.enum.attendance_status import AttendanceStatus
from app.model.attendance import Attendance
from app.model.employee import Employee

# Davomatda "kelgan" (present) hisoblanadigan statuslar — check-out qilingan
# "left" ham kiradi, aks holda tugagan ish kuni g'oyibdek sanaladi.
ATTENDED = (AttendanceStatus.came, AttendanceStatus.late, AttendanceStatus.left)


class AttendanceRepository:
    def __init__(self, database: SessionsDep):
        self.database = database

    async def get_by_id(self, id: UUID) -> Attendance | None:
        query = select(Attendance).where(Attendance.id == id)
        return await self.database.scalar(query)

    async def get_open(self, employee_id: UUID) -> Attendance | None:
        query = (
            select(Attendance)
            .where(Attendance.employee_id == employee_id)
            .where(Attendance.check_out.is_(None))
            .where(Attendance.status.in_([AttendanceStatus.came, AttendanceStatus.late]))
            .where(Attendance.work_date >= today_local() - timedelta(days=1))
            .order_by(Attendance.check_in.desc())
            .limit(1)
        )
        return await self.database.scalar(query)

    async def get_last_checkout(self, employee_id: UUID) -> Attendance | None:
        """Eng oxirgi TUGAGAN (check_out qilingan) smenani qaytaradi.

        Midnight-crossing double check-in himoyasi uchun: kunlik limit work_date'ga
        bog'liq, shuning uchun yarim tunni kesib o'tgan smena ikkinchi to'lovga yo'l
        ochib qo'yardi. Buni oxirgi check-out vaqti orqali (kalendar kunidan mustaqil)
        tekshiramiz."""
        query = (
            select(Attendance)
            .where(Attendance.employee_id == employee_id)
            .where(Attendance.check_out.is_not(None))
            .order_by(Attendance.check_out.desc())
            .limit(1)
        )
        return await self.database.scalar(query)

    async def get_today_active(self, employee_id: UUID) -> Attendance | None:
        query = (
            select(Attendance)
            .where(Attendance.employee_id == employee_id)
            .where(Attendance.work_date == today_local())
            .where(Attendance.check_out.is_(None))
        )
        return await self.database.scalar(query)

    async def get_today_placeholder(self, employee_id: UUID) -> Attendance | None:
        """Bugungi absent/leave/reason "placeholder" yozuvi (agar bo'lsa).

        Avto-job bugun kelmagan deb absent (yoki ta'tilda leave) yozib qo'ygan
        bo'lishi mumkin. Keyin xodim haqiqatdan kelib check-in qilsa, YANGI yozuv
        yaratish o'rniga shu placeholder'ni qayta ishlatamiz — aks holda bitta
        kunda ikkita yozuv (absent + came) qolib, hisobotni chalkashtiradi.
        """
        query = (
            select(Attendance)
            .where(Attendance.employee_id == employee_id)
            .where(Attendance.work_date == today_local())
            .where(Attendance.status.in_([
                AttendanceStatus.absent,
                AttendanceStatus.leave,
                AttendanceStatus.reason,
            ]))
            .where(Attendance.check_in.is_(None))
            .order_by(Attendance.id.desc())
            .limit(1)
        )
        return await self.database.scalar(query)

    async def get_today_count(self, employee_id: UUID) -> int:
        query = (
            select(func.count())
            .select_from(Attendance)
            .where(Attendance.employee_id == employee_id)
            .where(Attendance.work_date == today_local())
        )

        result = await self.database.scalar(query)
        return result or 0

    async def get_today_attended_count(self, employee_id: UUID) -> int:
        """Bugungi HAQIQIY davomat soni (came/late/left).

        get_today_count BARCHA yozuvni sanaydi — absent/leave/reason ham. Lekin
        "bugun ish kuning tugaganmi?" yoki "kunlik check-in limiti" uchun faqat
        haqiqiy davomat muhim. Avto-job bugun absent yozib qo'ygan bo'lsa ham,
        keyin kelgan xodim check-in qila olishi kerak — shu sababli bu yerda
        absent/leave/reason hisoblanmaydi.
        """
        query = (
            select(func.count())
            .select_from(Attendance)
            .where(Attendance.employee_id == employee_id)
            .where(Attendance.work_date == today_local())
            .where(Attendance.status.in_([
                AttendanceStatus.came,
                AttendanceStatus.late,
                AttendanceStatus.left,
            ]))
        )

        result = await self.database.scalar(query)
        return result or 0
        
    async def get_by_employee(
        self,
        employee_id: UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Attendance]:
        
        query = (
            select(Attendance)
            .where(Attendance.employee_id == employee_id)
            .order_by(Attendance.work_date.desc(), Attendance.id.desc())
            .limit(limit)
            .offset(offset)
        )
        
        result = await self.database.scalars(query)
        return list(result)


    async def get_for_month(
        self,
        employee_id: UUID,
        year: int,
        month: int,
    ) -> list[Attendance]:
        
        query = (
            select(Attendance)
            .where(Attendance.employee_id == employee_id)
            .where(extract("year", Attendance.work_date) == year)
            .where(extract("month", Attendance.work_date) == month)
            .order_by(Attendance.work_date.asc(), Attendance.id.desc())
        )
        
        result = await self.database.scalars(query)
        return list(result)

    async def get_for_team(
        self,
        leader_id: UUID,
        work_date: date,
    ) -> list[Attendance]:
        query = (
            select(Attendance)
            .options(selectinload(Attendance.employee))
            .join(Employee, Attendance.employee_id == Employee.id)
            .where(Employee.leader_id == leader_id)
            .where(Attendance.work_date == work_date)
            .order_by(Attendance.work_date.asc())
        )
        
        result = await self.database.scalars(query)
        return list(result)

    async def count_by_employee(self, employee_id: UUID) -> int:
        query = (
            select(func.count())
            .select_from(Attendance)
            .where(Attendance.employee_id == employee_id)
        )
        
        return await self.database.scalar(query) or 0

    async def create(self, attendance: Attendance) -> Attendance:
        self.database.add(attendance)
        await self.database.commit()
        await self.database.refresh(attendance)
        return attendance

    async def employee_ids_with_record_on(self, work_date: date) -> set[UUID]:
        """Berilgan kunda allaqachon davomat yozuvi bor xodim id'lari.

        Avto-job o'sha kun yozuvi BO'LMAGAN xodimlargagina absent/leave yozadi
        (mavjudini ustiga yozmaslik uchun)."""
        query = (
            select(Attendance.employee_id)
            .where(Attendance.work_date == work_date)
            .distinct()
        )
        result = await self.database.scalars(query)
        return set(result)

    async def get_in_range(self, employee_id: UUID, start: date, end: date) -> list[Attendance]:
        """Bitta xodimning [start, end] oralig'idagi davomat yozuvlari."""
        query = (
            select(Attendance)
            .where(Attendance.employee_id == employee_id)
            .where(Attendance.work_date >= start)
            .where(Attendance.work_date <= end)
            .order_by(Attendance.work_date.asc())
        )
        result = await self.database.scalars(query)
        return list(result)

    async def bulk_create(self, attendances: list[Attendance]) -> int:
        """Bir nechta yozuvni bitta tranzaksiyada yaratadi. Yaratilgan sonni qaytaradi."""
        if not attendances:
            return 0
        self.database.add_all(attendances)
        await self.database.commit()
        return len(attendances)

    async def update(self, attendance: Attendance) -> Attendance:
        await self.database.commit()
        await self.database.refresh(attendance)
        return attendance

    async def get_daily_trend_for_leader(self, leader_id: UUID, start_date: date, end_date: date) -> list:
        query = (
            select(
                Attendance.work_date.label("date"),
                # present = kelgan va o'z vaqtida; late = kelgan lekin kechikkan.
                # is_late check-out'dan keyin ham saqlanadi, shuning uchun ishonchli.
                func.count().filter(
                    Attendance.status.in_(ATTENDED), Attendance.is_late.is_(False)
                ).label("present"),
                func.count().filter(
                    Attendance.status.in_(ATTENDED), Attendance.is_late.is_(True)
                ).label("late"),
                func.count().filter(Attendance.status == AttendanceStatus.absent).label("absent"),
            )
            .select_from(Attendance)
            .join(Employee, Attendance.employee_id == Employee.id)
            .where(Employee.leader_id == leader_id)
            .where(Attendance.work_date >= start_date)
            .where(Attendance.work_date <= end_date)
            .group_by(Attendance.work_date)
            .order_by(Attendance.work_date.asc())
        )

        result = await self.database.execute(query)
        return result.all()

    async def get_recent_for_leader(self, leader_id: UUID, limit: int = 20) -> list[Attendance]:
        query = (
            select(Attendance)
            .options(selectinload(Attendance.employee).selectinload(Employee.user))
            .join(Employee, Attendance.employee_id == Employee.id)
            .where(Employee.leader_id == leader_id)
            .order_by(Attendance.updated_at.desc())
            .limit(limit)
        )

        result = await self.database.scalars(query)
        return list(result)

    async def get_status_counts_for_leader(self, leader_id: UUID, start_date: date, end_date: date):
        query = (
            select(
                func.count().label("total"),
                func.count().filter(
                    Attendance.status.in_([
                        AttendanceStatus.came,
                        AttendanceStatus.left,
                        AttendanceStatus.late,
                    ])
                ).label("present"),
            )
            .select_from(Attendance)
            .join(Employee, Attendance.employee_id == Employee.id)
            .where(Employee.leader_id == leader_id)
            .where(Attendance.work_date >= start_date)
            .where(Attendance.work_date <= end_date)
        )

        return (await self.database.execute(query)).one()

    async def get_month_stats(self, employee_ids: list[UUID], year: int, month: int) -> dict:
        if not employee_ids:
            return {}

        query = (
            select(
                Attendance.employee_id.label("employee_id"),
                func.count().label("total"),
                # present = kelgan (left ham kiradi); on_time = kelgan va kechikmagan.
                func.count().filter(
                    Attendance.status.in_(ATTENDED), Attendance.is_late.is_(False)
                ).label("on_time"),
                func.count().filter(Attendance.status.in_(ATTENDED)).label("present"),
            )
            .where(Attendance.employee_id.in_(employee_ids))
            .where(extract("year", Attendance.work_date) == year)
            .where(extract("month", Attendance.work_date) == month)
            .group_by(Attendance.employee_id)
        )

        result = await self.database.execute(query)
        return {row.employee_id: row for row in result.all()}
