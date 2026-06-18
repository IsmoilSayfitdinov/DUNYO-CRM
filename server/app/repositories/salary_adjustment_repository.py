from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.db.database import SessionsDep
from app.model.employee import Employee
from app.model.salary_adjustment import SalaryAdjustment


class SalaryAdjustmentRepository:
    def __init__(self, database: SessionsDep):
        self.database = database

    async def create(self, adjustment: SalaryAdjustment) -> SalaryAdjustment:
        self.database.add(adjustment)
        await self.database.commit()
        await self.database.refresh(adjustment)
        return adjustment

    async def delete(self, adjustment: SalaryAdjustment) -> None:
        """Avans/premiya yozuvini o'chiradi (TOCTOU poygasida bekor qilish uchun)."""
        await self.database.delete(adjustment)
        await self.database.commit()

    async def list_by_employee_month(self, employee_id: UUID, month: date) -> list[SalaryAdjustment]:
        query = (
            select(SalaryAdjustment)
            .where(SalaryAdjustment.employee_id == employee_id, SalaryAdjustment.month == month)
            .order_by(SalaryAdjustment.created_at.desc())
        )
        return list(await self.database.scalars(query))

    async def list_by_employee(self, employee_id: UUID, limit: int = 100) -> list[SalaryAdjustment]:
        query = (
            select(SalaryAdjustment)
            .where(SalaryAdjustment.employee_id == employee_id)
            .order_by(SalaryAdjustment.created_at.desc())
            .limit(limit)
        )
        return list(await self.database.scalars(query))

    async def list_for_leader_month(self, leader_id: UUID, month: date) -> list[SalaryAdjustment]:
        """Bitta rahbarning BARCHA xodimlari uchun shu oydagi avans/premiyalar
        (xodim + user nomi bilan eager-load)."""
        query = (
            select(SalaryAdjustment)
            .join(Employee, Employee.id == SalaryAdjustment.employee_id)
            .where(Employee.leader_id == leader_id, SalaryAdjustment.month == month)
            .options(selectinload(SalaryAdjustment.employee).selectinload(Employee.user))
            .order_by(SalaryAdjustment.created_at.desc())
        )
        return list(await self.database.scalars(query))

    async def sums_for_month(self, employee_id: UUID, month: date) -> tuple[Decimal, Decimal]:
        """O'sha oy uchun (avans_yig'indi, premiya_yig'indi) — ikkalasi ham musbat."""
        query = (
            select(SalaryAdjustment.type, func.coalesce(func.sum(SalaryAdjustment.amount), 0))
            .where(SalaryAdjustment.employee_id == employee_id, SalaryAdjustment.month == month)
            .group_by(SalaryAdjustment.type)
        )
        rows = await self.database.execute(query)
        advance = Decimal("0")
        bonus = Decimal("0")
        for type_, total in rows.all():
            if type_ == "advance":
                advance = Decimal(total)
            elif type_ == "bonus":
                bonus = Decimal(total)
        return advance, bonus
