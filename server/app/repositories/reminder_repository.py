from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.database import SessionsDep
from app.model.employee import Employee
from app.model.reminder import Reminder


class ReminderRepository:
    def __init__(self, database: SessionsDep):
        self.database = database

    async def create(self, reminder: Reminder) -> Reminder:
        self.database.add(reminder)
        await self.database.commit()
        await self.database.refresh(reminder)
        return reminder

    async def get_by_id(self, reminder_id: UUID) -> Reminder | None:
        return await self.database.scalar(select(Reminder).where(Reminder.id == reminder_id))

    async def list_for_leader(self, leader_id: UUID, limit: int = 100) -> list[Reminder]:
        """Rahbar yuborgan barcha eslatmalar (xodim + user nomi bilan)."""
        query = (
            select(Reminder)
            .where(Reminder.created_by == leader_id)
            .options(selectinload(Reminder.employee).selectinload(Employee.user))
            .order_by(Reminder.created_at.desc())
            .limit(limit)
        )
        return list(await self.database.scalars(query))

    async def list_for_employee(self, employee_id: UUID, limit: int = 100) -> list[Reminder]:
        """Xodimga kelgan eslatmalar."""
        query = (
            select(Reminder)
            .where(Reminder.employee_id == employee_id)
            .order_by(Reminder.created_at.desc())
            .limit(limit)
        )
        return list(await self.database.scalars(query))

    async def delete(self, reminder: Reminder) -> None:
        await self.database.delete(reminder)
        await self.database.commit()

    async def save(self, reminder: Reminder) -> Reminder:
        await self.database.commit()
        await self.database.refresh(reminder)
        return reminder
