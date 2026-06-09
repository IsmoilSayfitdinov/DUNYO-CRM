from datetime import date, timedelta
from uuid import UUID

from fastapi import Depends, HTTPException, status

from app.core.timezone import today_local
from app.enum.attendance_status import AttendanceStatus
from app.helper.attendance_score import compute_attendance_score
from app.model.user import User
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.leader_repository import LeaderRepository
from app.repositories.salary_history_repository import SalaryHistoryRepository
from app.schemas.dashboard import ActivityItem, DashboardAlert, DashboardOverview, TopEmployeeItem

PRESENT_STATUSES = (AttendanceStatus.came, AttendanceStatus.left, AttendanceStatus.late)


class DashboardService:
    LATE_THRESHOLD = 3  # oyiga shundan ko'p kechiksa — ogohlantirish

    def __init__(
        self,
        attendance_repo: AttendanceRepository = Depends(),
        employee_repo: EmployeeRepository = Depends(),
        leader_repo: LeaderRepository = Depends(),
        salary_repo: SalaryHistoryRepository = Depends(),
    ):
        self.attendance_repo = attendance_repo
        self.employee_repo = employee_repo
        self.leader_repo = leader_repo
        self.salary_repo = salary_repo

    async def _get_leader(self, user_id: UUID):
        leader = await self.leader_repo.get_by_user_id(user_id)
        if not leader:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Siz rahbar emasiz !")
        return leader

    @staticmethod
    def _period_start(period: str, today: date) -> date:
        if period == "week":
            return today - timedelta(days=today.weekday())  # dushanbadan
        if period == "month":
            return today.replace(day=1)
        return today  # "today"

    @staticmethod
    def _full_name(user: User) -> str:
        # first_name / last_name modelda nullable — None bo'lsa "None None" chiqmasin
        return " ".join(filter(None, [user.first_name, user.last_name])) or "Noma'lum"

    async def get_overview(self, user_id: UUID, period: str = "today") -> DashboardOverview:
        leader = await self._get_leader(user_id)
        today = today_local()
        start = self._period_start(period, today)

        # Bugungi holat (snapshot). Bir kunda 2 yozuv bo'lsa ham xodim BIR marta
        # sanaladi — shu uchun employee_id bo'yicha distinct.
        team_today = await self.attendance_repo.get_for_team(leader.id, today)
        present_today = len({a.employee_id for a in team_today if a.status in PRESENT_STATUSES})
        # late — is_late check-out'dan keyin ham saqlanadi, shuning uchun ishonchli.
        late_today = len({a.employee_id for a in team_today if a.is_late})

        # absent uchun faqat FAOL xodimlar hisobga olinadi (deaktivlar emas).
        employees = await self.employee_repo.get_by_leader_id(leader.id)
        total = sum(1 for e in employees if e.is_active)

        # Tanlangan davr bo'yicha davomat foizi
        counts = await self.attendance_repo.get_status_counts_for_leader(leader.id, start, today)
        attendance_rate = round(counts.present / counts.total * 100, 1) if counts.total else 0.0

        # Joriy oy ish haqi (hisoblangan + to'langan)
        summary = await self.salary_repo.get_summary_for_leader(leader.id, today.year, today.month)

        return DashboardOverview(
            total_employees=total,
            present_today=present_today,
            absent_today=max(total - present_today, 0),
            late_today=late_today,
            attendance_rate=attendance_rate,
            total_payroll=summary["total_paid"] + summary["total_unpaid"],
        )

    async def get_alerts(self, user_id: UUID) -> list[DashboardAlert]:
        leader = await self._get_leader(user_id)
        today = today_local()

        employees = await self.employee_repo.get_by_leader_id(leader.id)
        active = [e for e in employees if e.is_active]

        team_today = await self.attendance_repo.get_for_team(leader.id, today)
        present_ids = {a.employee_id for a in team_today if a.status in PRESENT_STATUSES}

        stats = await self.attendance_repo.get_month_stats(
            [e.id for e in active], today.year, today.month
        )

        alerts: list[DashboardAlert] = []

        # 1) Bugun kelmaganlar
        for e in active:
            if e.id not in present_ids:
                alerts.append(DashboardAlert(
                    type="absent",
                    severity="warning",
                    message=f"{self._full_name(e.user)} bugun kelmadi",
                    employee_id=e.id,
                ))

        # 2) Tez-tez kechikadiganlar (bu oy)
        for e in active:
            s = stats.get(e.id)
            if s:
                late_count = s.present - s.on_time
                if late_count > self.LATE_THRESHOLD:
                    alerts.append(DashboardAlert(
                        type="late",
                        severity="info",
                        message=f"{self._full_name(e.user)} bu oy {late_count} marta kechikdi",
                        employee_id=e.id,
                    ))

        # 3) To'lanmagan oyliklar (o'tgan oylar)
        first_of_month = today.replace(day=1)
        unpaid = await self.salary_repo.get_unpaid_for_leader(leader.id, first_of_month)
        for s in unpaid:
            alerts.append(DashboardAlert(
                type="unpaid",
                severity="danger",
                message=f"{self._full_name(s.employee.user)} — {s.month:%Y-%m} oyligi to'lanmagan",
                employee_id=s.employee_id,
            ))

        return alerts

    async def get_top_employees(self, user_id: UUID, limit: int = 5) -> list[TopEmployeeItem]:
        leader = await self._get_leader(user_id)
        today = today_local()

        employees = await self.employee_repo.get_by_leader_id(leader.id)
        active = [e for e in employees if e.is_active]

        stats = await self.attendance_repo.get_month_stats(
            [e.id for e in active], today.year, today.month
        )

        items: list[TopEmployeeItem] = []
        for e in active:
            s = stats.get(e.id)
            if s:
                score = compute_attendance_score(s.total, s.present, s.on_time)
                present_days, total_days = s.present, s.total
            else:
                score, present_days, total_days = 0, 0, 0

            items.append(TopEmployeeItem(
                employee_id=e.id,
                name=self._full_name(e.user),
                position=e.position,
                score=score,
                present_days=present_days,
                total_days=total_days,
            ))

        items.sort(key=lambda x: x.score, reverse=True)
        return items[:limit]

    async def get_activity(self, user_id: UUID, limit: int = 20) -> list[ActivityItem]:
        leader = await self._get_leader(user_id)
        rows = await self.attendance_repo.get_recent_for_leader(leader.id, limit)

        items: list[ActivityItem] = []
        for r in rows:
            name = self._full_name(r.employee.user)
            if r.check_out:
                items.append(ActivityItem(
                    type="check_out",
                    employee_name=name,
                    timestamp=r.check_out,
                    message=f"{name} ishdan chiqdi",
                ))
            elif r.check_in:
                items.append(ActivityItem(
                    type="check_in",
                    employee_name=name,
                    timestamp=r.check_in,
                    message=f"{name} ishga keldi",
                ))

        return items
