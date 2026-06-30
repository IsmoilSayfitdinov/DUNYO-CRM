from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.database import SessionsDep
from app.model.employee import Employee
from app.model.task import Task


class TasksRepository:
    def __init__(self, database: SessionsDep):
        self.database = database

    async def create(self, task: Task) -> Task:
        self.database.add(task)
        await self.database.commit()
        await self.database.refresh(task)
        return task

    async def get_by_id(self, task_id: UUID) -> Task | None:
        return await self.database.scalar(select(Task).where(Task.id == task_id))

    async def list_for_leader(self, leader_id: UUID, limit: int, offset: int) -> list[Task]:
        """Rahbar yaratgan vazifalar (xodim + user nomi bilan eager-load).

        limit/offset — cheksiz natija (DoS) oldini olish uchun. Sahifalab olamiz.
        """
        query = (
            select(Task)
            .where(Task.created_by == leader_id)
            .options(selectinload(Task.employee).selectinload(Employee.user))
            .order_by(Task.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(await self.database.scalars(query))

    async def list_for_employee(self, employee_id: UUID, limit: int, offset: int) -> list[Task]:
        """Xodimga biriktirilgan vazifalar (sahifalangan)."""
        query = (
            select(Task)
            .where(Task.employee_id == employee_id)
            .order_by(Task.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(await self.database.scalars(query))

    async def delete(self, task: Task) -> None:
        await self.database.delete(task)
        await self.database.commit()

    async def save(self, task: Task) -> Task:
        await self.database.commit()
        await self.database.refresh(task)
        return task
