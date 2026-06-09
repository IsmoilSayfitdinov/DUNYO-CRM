from uuid import UUID

from sqlalchemy import delete, select, update

from app.db.database import SessionsDep
from app.model.branch import Branch
from app.model.employee import Employee


class BranchRepository:
    def __init__(self, database: SessionsDep):
        self.database = database

    async def get_by_id(self, id: UUID) -> Branch | None:
        query = select(Branch).where(Branch.id == id)
        return await self.database.scalar(query)

    async def get_by_leader(self, leader_id: UUID) -> list[Branch]:
        query = (
            select(Branch)
            .where(Branch.leader_id == leader_id)
            .order_by(Branch.created_at.desc())
        )
        result = await self.database.scalars(query)
        return list(result)

    async def create(self, branch: Branch) -> Branch:
        self.database.add(branch)
        await self.database.commit()
        await self.database.refresh(branch)
        return branch

    async def update(self, branch: Branch) -> Branch:
        await self.database.commit()
        await self.database.refresh(branch)
        return branch
    
    async def delete(self, branch_id: UUID, leader_id: UUID) -> int:
        """Filialni HARD-delete qiladi (faqat egasi — leader_id).

        Avval shu filialdagi xodimlarni filialdan ajratamiz (branch_id=NULL),
        aks holda Employee.branch_id FK (RESTRICT) o'chirishni bloklab xato beradi.
        Hammasi BITTA tranzaksiyada. Qaytaradi: o'chgan filiallar soni (0 = topilmadi/begona).
        """
        # Egalik tekshiruvi — begona/yo'q filialning xodimlariga TEGMAYMIZ
        owned = await self.database.scalar(
            select(Branch.id).where(Branch.id == branch_id, Branch.leader_id == leader_id)
        )
        if owned is None:
            return 0

        # 1) Xodimlarni filialdan bo'shatamiz (FK to'sig'ini olib tashlaymiz)
        await self.database.execute(
            update(Employee)
            .where(Employee.branch_id == branch_id)
            .values(branch_id=None)
        )

        # 2) Filialning o'zini o'chiramiz (egalik filtri — himoya qatlami)
        result = await self.database.execute(
            delete(Branch).where(Branch.id == branch_id, Branch.leader_id == leader_id)
        )

        # 3) Bitta tranzaksiya — oxirida commit
        await self.database.commit()
        return result.rowcount