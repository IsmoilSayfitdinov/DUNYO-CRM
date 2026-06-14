from datetime import date
from uuid import UUID

from fastapi import Depends
from fastapi import HTTPException, status

from app.core.security import hash_password
from app.core.timezone import now_utc, today_local
from app.enum.attendance_status import AttendanceStatus
from app.helper.attendance_score import compute_attendance_score
from app.helper.verify_leader_owns_employee import verify_leader_owns_employee
from app.enum.role import Role
from app.model.employee import Employee
from app.model.user import User
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.branch_repository import BranchRepository
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.leader_repository import LeaderRepository
from app.repositories.user_repository import UserRepository
from app.schemas.employee import EmployeeListResponse, EmployeeInfo, EmployeeCreate, EmployeeUpdate

# Davomat baholashda "kelgan" deb hisoblanadigan statuslar (check-out qilingan
# "left" ham KELGAN bo'ladi — aks holda tugagan ish kuni g'oyibdek baholanardi).
ATTENDED_STATUSES = (AttendanceStatus.came, AttendanceStatus.late, AttendanceStatus.left)


class EmployeeService:
    USER_FIELDS = {"first_name", "last_name", "username", "phone"}
    # Faqat shu maydonlarni update qabul qiladi (mass-assignment'dan himoya).
    EMPLOYEE_FIELDS = {
        "is_active", "branch_id", "position",
        "shift_start", "shift_end", "shift_number", "hourly_rate", "nfc_uid"
    }

    def __init__(
        self,
        repo: EmployeeRepository = Depends(),
        userRepo: UserRepository = Depends(),
        leaderRepo: LeaderRepository = Depends(),
        attendanceRepo: AttendanceRepository = Depends(),
        branchRepo: BranchRepository = Depends(),
    ):
        self.repo = repo
        self.user_repo = userRepo
        self.leader_repo = leaderRepo
        self.attendance_repo = attendanceRepo
        self.branch_repo = branchRepo

    # ---------- authz yordamchilari ----------

    @staticmethod
    def _is_superuser(caller: User) -> bool:
        return caller.role == Role.leader

    async def _require_leader(self, caller: User):
        leader = await self.leader_repo.get_by_user_id(caller.id)
        if not leader:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Siz rahbar emasiz !")
        return leader

    async def _validate_branch(self, branch_id: UUID | None, leader_id: UUID | None, caller: User) -> None:
        """branch_id berilgan bo'lsa: mavjud, faol va (superuser bo'lmasa) shu
        rahbarga tegishli ekanini tekshiradi."""
        if branch_id is None:
            return
        branch = await self.branch_repo.get_by_id(branch_id)
        if not branch or not branch.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filial topilmadi yoki faol emas !")
        if not self._is_superuser(caller) and leader_id is not None and branch.leader_id != leader_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu filial sizga tegishli emas !")

    # ---------- scoring ----------

    async def get_employees(self, caller: User, limit: int, offset: int, branch_id: UUID | None = None) -> EmployeeListResponse:
        # Superuser — barcha xodimlar; oddiy rahbar — faqat o'z jamoasi (tenant izolyatsiya).
        # branch_id berilsa — faqat o'sha filial xodimlari (filial bo'yicha filter).
        if self._is_superuser(caller):
            employees = await self.repo.get_all(limit=limit, offset=offset, branch_id=branch_id)
            total = await self.repo.count(branch_id=branch_id)
        else:
            leader = await self._require_leader(caller)
            employees = await self.repo.get_by_leader_id(leader.id, limit=limit, offset=offset, branch_id=branch_id)
            total = await self.repo.count_by_leader(leader.id, branch_id=branch_id)

        today = today_local()
        stats = await self.attendance_repo.get_month_stats(
            [e.id for e in employees], today.year, today.month
        )

        items = []
        for e in employees:
            info = EmployeeInfo.model_validate(e)
            s = stats.get(e.id)
            info.score = compute_attendance_score(s.total, s.present, s.on_time) if s else 0
            items.append(info)

        return EmployeeListResponse(
            items=items,
            total=total,
            offset=offset,
            limit=limit
        )

    async def _compute_score(self, employee_id: UUID) -> int:
        today = today_local()
        records = await self.attendance_repo.get_for_month(
            employee_id=employee_id, year=today.year, month=today.month
        )
        total = len(records)
        present = sum(1 for r in records if r.status in ATTENDED_STATUSES)
        on_time = sum(1 for r in records if r.status in ATTENDED_STATUSES and not r.is_late)
        return compute_attendance_score(total, present, on_time)

    async def get_employee_by_id(self, caller: User, id: UUID) -> EmployeeInfo:
        if self._is_superuser(caller):
            employee = await self.repo.get_by_id(id=id)
            if not employee:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Xodim topilmadi !")
        else:
            employee = await verify_leader_owns_employee(
                self.leader_repo, self.repo, user_id=caller.id, employee_id=id
            )

        info = EmployeeInfo.model_validate(employee)
        info.score = await self._compute_score(employee.id)
        return info

    async def get_my_profile(self, user_id: UUID) -> EmployeeInfo:
        employee = await self.repo.get_by_user_id(user_id=user_id)
        if not employee:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Xodim topilmadi !")

        info = EmployeeInfo.model_validate(employee)
        info.score = await self._compute_score(employee.id)
        return info

    async def create(self, caller: User, data: EmployeeCreate) -> EmployeeInfo:
        # Rahbarni aniqlash: superuser data.leader_user_id orqali boshqa rahbarga
        # ham yarata oladi; oddiy rahbar faqat O'ZIGA biriktiradi (IDOR'dan himoya).
        if self._is_superuser(caller):
            if not data.leader_user_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="leader_user_id majburiy !")
            leader = await self.leader_repo.get_by_user_id(data.leader_user_id)
            if not leader:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rahbar topilmadi !")
        else:
            leader = await self._require_leader(caller)

        existing = await self.user_repo.get_user_by_username(data.username)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bu foydalanuvchi nomi allaqachon band !")

        await self._validate_branch(data.branch_id, leader.id, caller)

        user = User(
            username=data.username,
            password_hash=hash_password(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
            role=Role.employee,
        )

        self.repo.database.add(user)
        await self.repo.database.flush()

        employee = Employee(
            user_id=user.id,
            leader_id=leader.id,
            branch_id=data.branch_id,
            position=data.position,
            shift_start=data.shift_start,
            shift_end=data.shift_end,
            shift_number=data.shift_number,
            hourly_rate=data.hourly_rate,
        )

        self.repo.database.add(employee)
        await self.repo.database.commit()

        return await self.get_employee_by_id(caller, employee.id)

    async def update(self, caller: User, data: EmployeeUpdate, id: UUID) -> EmployeeInfo:
        # Egalik tekshiruvi (superuser bypass)
        if self._is_superuser(caller):
            employee = await self.repo.get_by_id(id=id)
            if not employee:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Xodim topilmadi !")
        else:
            employee = await verify_leader_owns_employee(
                self.leader_repo, self.repo, user_id=caller.id, employee_id=id
            )

        update_fields = data.model_dump(exclude_unset=True)

        new_username = update_fields.get("username")
        if new_username and new_username != employee.user.username:
            existing = await self.user_repo.get_user_by_username(new_username)
            if existing:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bu foydalanuvchi nomi allaqachon band !")

        # Filial o'zgartirilsa — egalik/mavjudlik tekshiruvi
        if "branch_id" in update_fields:
            await self._validate_branch(update_fields["branch_id"], employee.leader_id, caller)

        # Rahbarni qayta biriktirish faqat superuserga ruxsat
        if "leader_user_id" in update_fields and update_fields["leader_user_id"]:
            if not self._is_superuser(caller):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Rahbarni qayta biriktirishga ruxsat yo'q !")
            new_leader = await self.leader_repo.get_by_user_id(update_fields["leader_user_id"])
            if not new_leader:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rahbar topilmadi !")
            employee.leader_id = new_leader.id

        for field, value in update_fields.items():
            if field in self.USER_FIELDS:
                setattr(employee.user, field, value)
            elif field in self.EMPLOYEE_FIELDS:
                setattr(employee, field, value)

       
        if "is_active" in update_fields:
            employee.user.is_active = update_fields["is_active"]

        await self.repo.database.commit()

        return await self.get_employee_by_id(caller, employee.id)

    async def delete(self, caller: User, id: UUID) -> bool:
        if self._is_superuser(caller):
            employee = await self.repo.get_by_id(id=id)
            if not employee:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Xodim topilmadi !")
        else:
            employee = await verify_leader_owns_employee(
                self.leader_repo, self.repo, user_id=caller.id, employee_id=id
            )

        employee.is_active = False
        employee.user.is_active = False
        employee.deleted_at = now_utc()
        await self.repo.database.commit()

        return True
    
