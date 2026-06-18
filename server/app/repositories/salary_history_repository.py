from datetime import date, datetime
from decimal import Decimal
from uuid import UUID
from sqlalchemy import extract, func, select, update
from app.model.employee import Employee
from app.model.salary_history import SalaryHistory
from sqlalchemy.orm import selectinload
from app.db.database import SessionsDep


class SalaryHistoryRepository:
    def __init__(self, database: SessionsDep):
         self.database = database
         
    async def get_by_id(self, id: UUID) -> SalaryHistory | None:
        query = (
            select(SalaryHistory)
            .where(SalaryHistory.id == id)
        )
        return await self.database.scalar(query)
   
    async def get_by_employee(self, employee_id: UUID, limit: int, offset: int) -> list[SalaryHistory] | None:
        query = (
            select(SalaryHistory)
            .options(selectinload(SalaryHistory.employee))
            .where(SalaryHistory.employee_id == employee_id)
            .offset(offset=offset)
            .limit(limit=limit)
            .order_by(SalaryHistory.month.desc())
        )
        result = await self.database.scalars(query)
        return list(result)
    
    async def get_count_by_employee(self, employee_id: UUID) -> int:
        query = (
            select(func.count())
            .select_from(SalaryHistory)
            .where(SalaryHistory.employee_id == employee_id)
        )

        result = await self.database.scalar(query)
        return result or 0

    async def get_count_by_month(self, leader_id: UUID, year: int, month: int, is_paid: bool) -> int:
        query = (
            select(func.count())
            .select_from(SalaryHistory)
            .where(extract("year", SalaryHistory.month) == year)
            .where(extract("month", SalaryHistory.month) == month)
            .join(Employee, SalaryHistory.employee_id == Employee.id)
            .where(Employee.leader_id == leader_id)
            .where(SalaryHistory.is_paid == is_paid)
        )

        result = await self.database.scalar(query)
        return result or 0

    async def get_by_employee_and_month(self, employee_id: UUID, year: int, month: int) -> SalaryHistory | None:
        
        query = (
            select(SalaryHistory)
            .where(SalaryHistory.employee_id == employee_id)
            .where(extract("year", SalaryHistory.month) == year)
            .where(extract("month", SalaryHistory.month) == month)
        )
        
        result = await self.database.scalar(query)
        
        return result
    
    async def update(self, salary: SalaryHistory) -> SalaryHistory:
        await self.database.commit()
        await self.database.refresh(salary)
        return salary

    async def mark_paid(self, salary_id: UUID, paid_at: datetime) -> int:
        """Atomik, idempotent to'lov: faqat hali to'lanmagan bo'lsa belgilaydi.

        Qaytaradi: o'zgartirilgan qatorlar soni (0 bo'lsa — allaqachon to'langan).
        """
        result = await self.database.execute(
            update(SalaryHistory)
            .where(SalaryHistory.id == salary_id, SalaryHistory.is_paid.is_(False))
            .values(is_paid=True, paid_at=paid_at)
        )
        await self.database.commit()
        return result.rowcount

    async def recompute_if_unpaid(self, employee_id: UUID, month: date, net: Decimal) -> int:
        """Oylik bonus/net'ini ATOMIK qayta hisoblaydi — faqat to'lanmagan oylik uchun.

        net = premiya - avans (ishorali). final_salary = max(0, base_salary + net):
        - WHERE is_paid IS FALSE — to'langan oylik ustiga yozilmaydi (lost-update poygasi yo'q).
        - GREATEST(0, ...) — avans bazadan oshsa ham final_salary manfiy bo'lmaydi (clamp).
        Bitta UPDATE = bitta atomik amal; read-modify-write poygasi yo'q.
        Qaytaradi: o'zgartirilgan qatorlar soni (0 bo'lsa — to'langan yoki topilmadi).
        """
        result = await self.database.execute(
            update(SalaryHistory)
            .where(
                SalaryHistory.employee_id == employee_id,
                SalaryHistory.month == month,
                SalaryHistory.is_paid.is_(False),
            )
            .values(
                bonus=net,
                final_salary=func.greatest(Decimal("0"), SalaryHistory.base_salary + net),
            )
        )
        await self.database.commit()
        return result.rowcount
    
    async def create(self, salary: SalaryHistory) -> SalaryHistory:
        self.database.add(salary)
        await self.database.commit()
        await self.database.refresh(salary)
        return salary

    async def get_summary_for_leader(self, leader_id: UUID, year: int, month: int) -> dict:
        query = (
            select(
                func.count().label("total"),
                func.count().filter(SalaryHistory.is_paid.is_(True)).label("paid_count"),
                func.count().filter(SalaryHistory.is_paid.is_(False)).label("unpaid_count"),
                func.coalesce(func.sum(SalaryHistory.final_salary).filter(SalaryHistory.is_paid.is_(True)), 0).label("total_paid"),
                func.coalesce(func.sum(SalaryHistory.final_salary).filter(SalaryHistory.is_paid.is_(False)), 0).label("total_unpaid"),
            )
            .select_from(SalaryHistory)
            .join(Employee, SalaryHistory.employee_id == Employee.id)
            .where(Employee.leader_id == leader_id)
            .where(extract("year", SalaryHistory.month) == year)
            .where(extract("month", SalaryHistory.month) == month)
        )

        row = (await self.database.execute(query)).one()
        return {
            "total": row.total,
            "paid_count": row.paid_count,
            "unpaid_count": row.unpaid_count,
            "total_paid": row.total_paid,
            "total_unpaid": row.total_unpaid,
        }
   
    async def get_salarys(self, leader_id: UUID, year: int, month: int,  limit: int, offset: int) -> list[SalaryHistory]:
       query = (
        select(SalaryHistory)
        .options(
                selectinload(SalaryHistory.employee).selectinload(Employee.user)
        )
        .join(Employee, SalaryHistory.employee_id == Employee.id)
        .where(Employee.leader_id == leader_id)
        .where(extract("year", SalaryHistory.month) == year)
        .where(extract("month", SalaryHistory.month) == month)
        .limit(limit=limit)
        .offset(offset=offset)
        .order_by(SalaryHistory.month.desc())
       )
       
       result = await self.database.scalars(query)
       
       return list(result)
   
    async def get_unpaid_for_leader(self, leader_id: UUID, before_month: date) -> list[SalaryHistory]:
        query = (
            select(SalaryHistory)
            .options(selectinload(SalaryHistory.employee).selectinload(Employee.user))
            .join(Employee, SalaryHistory.employee_id == Employee.id)
            .where(Employee.leader_id == leader_id)
            .where(SalaryHistory.is_paid.is_(False))
            .where(SalaryHistory.month < before_month)
            .order_by(SalaryHistory.month.asc())
        )
        result = await self.database.scalars(query)
        return list(result)

    async def get_salary_trend_for_leader(self, leader_id: UUID, start_month: date) -> list:
       query = (
           select(
               SalaryHistory.month.label("month"),
               func.coalesce(func.sum(SalaryHistory.final_salary), 0).label("total")
           )
           .select_from(SalaryHistory)
           .join(Employee, SalaryHistory.employee_id == Employee.id)
           .where(Employee.leader_id == leader_id)
           .where(SalaryHistory.month >= start_month)
           .group_by(SalaryHistory.month)
           .order_by(SalaryHistory.month.asc())
       )
       
       res = await self.database.execute(query)
       return res.all()