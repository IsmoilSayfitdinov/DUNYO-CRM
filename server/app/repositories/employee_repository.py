from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.orm import selectinload

from app.db.database import SessionsDep
from app.model.employee import Employee
from app.model.leader import Leader


class EmployeeRepository:
    def __init__(self, database: SessionsDep):
        self.database = database

    async def create(self, employee: Employee) -> Employee:
        self.database.add(employee)
        await self.database.commit()
        await self.database.refresh(employee)
        return employee

    async def get_by_id(self, id: UUID) -> Employee | None:
        # Soft-delete qilingan (deleted_at to'ldirilgan) xodimlar qaytarilmaydi.
        query = (
            select(Employee)
            .options(selectinload(Employee.user))
            .where(Employee.id == id)
            .where(Employee.deleted_at.is_(None))
        )
        return await self.database.scalar(query)

    async def get_by_nfc_uid(self, nfc_uid: str) -> Employee | None:
        query = (
            select(Employee)
            .where(Employee.nfc_uid == nfc_uid)
        )
        return await self.database.scalar(query)

    
    async def get_by_user_id(self, user_id: UUID) -> Employee | None:
        query = (
            select(Employee)
            .options(selectinload(Employee.user), selectinload(Employee.leader))
            .where(Employee.user_id == user_id)
            .where(Employee.deleted_at.is_(None))
        )
        return await self.database.scalar(query)

    async def get_by_leader_id(self, leader_id: UUID, limit: int | None = None, offset: int = 0, branch_id: UUID | None = None) -> list[Employee]:
        query = (
            select(Employee)
            .options(selectinload(Employee.user))
            .where(Employee.leader_id == leader_id)
            .where(Employee.deleted_at.is_(None))
            .order_by(Employee.created_at.desc())
        )
        if branch_id is not None:
            query = query.where(Employee.branch_id == branch_id)
        if limit is not None:
            query = query.limit(limit).offset(offset)
        result = await self.database.scalars(query)
        return list(result)

    async def count_by_leader(self, leader_id: UUID, branch_id: UUID | None = None) -> int:
        query = (
            select(func.count())
            .select_from(Employee)
            .where(Employee.leader_id == leader_id)
            .where(Employee.deleted_at.is_(None))
        )
        if branch_id is not None:
            query = query.where(Employee.branch_id == branch_id)
        return (await self.database.scalar(query)) or 0

    async def get_all(self, limit: int = 50, offset: int = 0, branch_id: UUID | None = None) -> list[Employee]:
        query = (
            select(Employee)
            .options(selectinload(Employee.user))
            .where(Employee.deleted_at.is_(None))
            .order_by(Employee.created_at.desc())
        )
        if branch_id is not None:
            query = query.where(Employee.branch_id == branch_id)
        query = query.limit(limit).offset(offset)
        result = await self.database.scalars(query)
        return list(result)

    async def count(self, branch_id: UUID | None = None) -> int:
        query = (
            select(func.count())
            .select_from(Employee)
            .where(Employee.deleted_at.is_(None))
        )
        if branch_id is not None:
            query = query.where(Employee.branch_id == branch_id)
        return (await self.database.scalar(query)) or 0

    async def update(self, employee: Employee) -> Employee:
        await self.database.commit()
        await self.database.refresh(employee)
        return employee

    async def delete(self, id: UUID) -> None:
        await self.database.execute(
            delete(Employee).where(Employee.id == id)
        )
        await self.database.commit()