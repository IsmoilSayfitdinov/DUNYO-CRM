from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.database import SessionsDep
from app.enum.leave_request_status import LeaveRequestStatus
from app.model.employee import Employee
from app.model.leave_request import LeaveRequest


class LeaveRequestRepository:
    def __init__(self, database: SessionsDep):
        self.database = database

    async def create(self, leave: LeaveRequest) -> LeaveRequest:
        self.database.add(leave)
        await self.database.commit()
        await self.database.refresh(leave)
        return leave

    async def get_by_id(self, id: UUID) -> LeaveRequest | None:
        query = (
            select(LeaveRequest)
            .options(selectinload(LeaveRequest.employee).selectinload(Employee.user))
            .where(LeaveRequest.id == id)
        )
        return await self.database.scalar(query)

    async def get_by_employee(self, employee_id: UUID) -> list[LeaveRequest]:
        query = (
            select(LeaveRequest)
            .where(LeaveRequest.employee_id == employee_id)
            .order_by(LeaveRequest.created_at.desc())
        )
        result = await self.database.scalars(query)
        return list(result)

    async def get_for_leader(self, leader_id: UUID, status: LeaveRequestStatus | None = None) -> list[LeaveRequest]:
        query = (
            select(LeaveRequest)
            .options(selectinload(LeaveRequest.employee).selectinload(Employee.user))
            .join(Employee, LeaveRequest.employee_id == Employee.id)
            .where(Employee.leader_id == leader_id)
            .where(Employee.deleted_at.is_(None))
            .order_by(LeaveRequest.created_at.desc())
        )
        if status is not None:
            query = query.where(LeaveRequest.status == status)
        result = await self.database.scalars(query)
        return list(result)

    async def update(self, leave: LeaveRequest) -> LeaveRequest:
        await self.database.commit()
        await self.database.refresh(leave)
        return leave

    async def employee_ids_on_approved_leave(self, work_date) -> set[UUID]:
        """Berilgan sanada TASDIQLANGAN ta'tilda bo'lgan xodim id'lari.

        Avto-job kelmagan kunni yozayotganda: shu to'plamdagi xodimga 'leave'
        (ta'tilda), aks holda 'absent' (kelmadi) qo'yiladi."""
        query = (
            select(LeaveRequest.employee_id)
            .where(LeaveRequest.status == LeaveRequestStatus.approved)
            .where(LeaveRequest.start_date <= work_date)
            .where(LeaveRequest.end_date >= work_date)
            .distinct()
        )
        result = await self.database.scalars(query)
        return set(result)
