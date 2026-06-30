import logging
from uuid import UUID

from fastapi import Depends, HTTPException, status

from app.enum.leave_request_status import LeaveRequestStatus
from app.helper.get_current_employee import get_current_employee
from app.helper.verify_leader_owns_employee import verify_leader_owns_employee
from app.model.leave_request import LeaveRequest
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.leader_repository import LeaderRepository
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.leave_request_repository import LeaveRequestRepository
from app.schemas.leave_request import LeaveRequestCreate, LeaveRequestInfo
from app.services.attendance_backfill_services import AttendanceBackfillService
from app.services.notification_services import NotificationService

logger = logging.getLogger("app.leave")


class LeaveRequestService:
    def __init__(
        self,
        repo: LeaveRequestRepository = Depends(),
        employee_repo: EmployeeRepository = Depends(),
        leader_repo: LeaderRepository = Depends(),
        attendance_repo: AttendanceRepository = Depends(),
        notif: NotificationService = Depends(),
    ):
        self.repo = repo
        self.employee_repo = employee_repo
        self.leader_repo = leader_repo
        self.attendance_repo = attendance_repo
        self.notif = notif
        # Ta'til tasdiqlanganda o'tgan/bugungi kunlarni darhol 'leave' qilish uchun
        self.backfill = AttendanceBackfillService(
            attendance_repo=attendance_repo,
            employee_repo=employee_repo,
            leave_repo=repo,
        )

    def _to_info(self, leave: LeaveRequest, with_name: bool = False) -> LeaveRequestInfo:
        days = (leave.end_date - leave.start_date).days + 1
        name = None
        if with_name and leave.employee and leave.employee.user:
            u = leave.employee.user
            name = " ".join(filter(None, [u.first_name, u.last_name])) or u.username
        return LeaveRequestInfo(
            id=leave.id,
            employee_id=leave.employee_id,
            employee_name=name,
            type=leave.type,
            start_date=leave.start_date,
            end_date=leave.end_date,
            days=days,
            reason=leave.reason,
            reject_reason=leave.reject_reason,
            status=leave.status,
            created_at=leave.created_at,
        )

    # ---------- Xodim ----------

    async def create(self, user_id: UUID, data: LeaveRequestCreate) -> LeaveRequestInfo:
        employee = await get_current_employee(self.employee_repo, user_id)
        leave = LeaveRequest(
            employee_id=employee.id,
            type=data.type,
            start_date=data.start_date,
            end_date=data.end_date,
            reason=data.reason,
            status=LeaveRequestStatus.pending,
        )
        created = await self.repo.create(leave)

        # Rahbarga bildirishnoma
        leader = await self.leader_repo.get_by_id(employee.leader_id)
        if leader:
            u = employee.user
            name = " ".join(filter(None, [u.first_name, u.last_name])) or u.username
            await self.notif.notify(
                user_id=leader.user_id,
                title="Yangi ta'til so'rovi",
                body=f"{name} ta'til so'radi ({data.start_date} – {data.end_date})",
                type="leave",
                link="/leader/leave",
            )
        return self._to_info(created)

    async def get_my(self, user_id: UUID, limit: int, offset: int) -> list[LeaveRequestInfo]:
        employee = await get_current_employee(self.employee_repo, user_id)
        leaves = await self.repo.get_by_employee(employee.id, limit=limit, offset=offset)
        return [self._to_info(l) for l in leaves]

    # ---------- Rahbar ----------

    async def get_for_leader(self, user_id: UUID, limit: int, offset: int, status_filter: LeaveRequestStatus | None = None) -> list[LeaveRequestInfo]:
        leader = await self.leader_repo.get_by_user_id(user_id)
        if not leader:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Siz rahbar emasiz !")
        leaves = await self.repo.get_for_leader(leader.id, limit=limit, offset=offset, status=status_filter)
        return [self._to_info(l, with_name=True) for l in leaves]

    async def _load_owned(self, user_id: UUID, leave_id: UUID) -> LeaveRequest:
        leave = await self.repo.get_by_id(leave_id)
        if not leave:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="So'rov topilmadi !")
        # Egalik: so'rov xodimi shu rahbarga tegishli bo'lishi kerak
        await verify_leader_owns_employee(
            self.leader_repo, self.employee_repo, user_id=user_id, employee_id=leave.employee_id
        )
        return leave

    async def approve(self, user_id: UUID, leave_id: UUID) -> LeaveRequestInfo:
        leave = await self._load_owned(user_id, leave_id)
        leave.status = LeaveRequestStatus.approved
        leave.reject_reason = None
        updated = await self.repo.update(leave)

        # Ta'til oralig'idagi o'tgan/bugungi kunlarni darhol 'leave' (ta'tilda) qilamiz:
        # avval 'absent' belgilangan bo'lsa ham 'leave' ga o'zgaradi (oylik hisoblanmaydi).
        # Kelajak kunlarni kunlik avto-job o'sha kun kelganda yozadi.
        try:
            await self.backfill.apply_approved_leave(
                updated.employee_id, updated.start_date, updated.end_date
            )
        except Exception:  # noqa: BLE001
            logger.exception("Ta'til tasdiqlash backfill xatosi (tasdiqlash davom etadi)")

        # Xodimga bildirishnoma
        await self.notif.notify(
            user_id=updated.employee.user_id,
            title="Ta'til so'rovi tasdiqlandi",
            body=f"{updated.start_date} – {updated.end_date} ta'tilingiz tasdiqlandi",
            type="leave",
            link="/employee/leave",
        )
        return self._to_info(updated, with_name=True)

    async def reject(self, user_id: UUID, leave_id: UUID, reason: str) -> LeaveRequestInfo:
        leave = await self._load_owned(user_id, leave_id)
        leave.status = LeaveRequestStatus.rejected
        leave.reject_reason = reason
        updated = await self.repo.update(leave)
        # Xodimga bildirishnoma (sabab bilan)
        await self.notif.notify(
            user_id=updated.employee.user_id,
            title="Ta'til so'rovi rad etildi",
            body=f"Sabab: {reason}",
            type="leave",
            link="/employee/leave",
        )
        return self._to_info(updated, with_name=True)
