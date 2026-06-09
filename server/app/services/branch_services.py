from uuid import UUID

from fastapi import Depends, HTTPException, status

from app.model.branch import Branch
from app.repositories.branch_repository import BranchRepository
from app.repositories.leader_repository import LeaderRepository
from app.schemas.branch import BranchCreate, BranchInfo, BranchUpdate


class BranchService:
    def __init__(
        self,
        repo: BranchRepository = Depends(),
        leader_repo: LeaderRepository = Depends(),
    ):
        self.repo = repo
        self.leader_repo = leader_repo

    async def _get_leader(self, user_id: UUID):
        leader = await self.leader_repo.get_by_user_id(user_id)
        if not leader:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Siz rahbar emasiz !")
        return leader

    async def create(self, user_id: UUID, data: BranchCreate) -> BranchInfo:
        leader = await self._get_leader(user_id)

        branch = Branch(
            name=data.name,
            latitude=data.latitude,
            longitude=data.longitude,
            radius_meters=data.radius_meters,
            leader_id=leader.id,
        )

        created = await self.repo.create(branch)
        return BranchInfo.model_validate(created)

    async def update(self, user_id: UUID, branch_id: UUID, data: BranchUpdate) -> BranchInfo:
        leader = await self._get_leader(user_id=user_id)

        branch = await self.repo.get_by_id(branch_id)
        if not branch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filial topilmadi !")

        # Egalik: leader faqat o'z filialini tahrirlay oladi (IDOR'dan himoya)
        if branch.leader_id != leader.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu filial sizga tegishli emas !")

        # Qisman update — faqat yuborilgan maydonlar o'zgaradi
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(branch, field, value)

        updated = await self.repo.update(branch)
        return BranchInfo.model_validate(updated)
    
    async def delete(self, branch_id: UUID, user_id: UUID) -> None:
        leader = await self._get_leader(user_id=user_id)

        # Repo self-safe: faqat shu leader'ning filialini o'chiradi (xodimlarni
        # bo'shatib) va o'chgan qatorlar sonini qaytaradi. 0 -> yo'q yoki begona.
        deleted = await self.repo.delete(branch_id=branch_id, leader_id=leader.id)
        if deleted == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Filial topilmadi yoki sizga tegishli emas !",
            )


    async def get_my_branches(self, user_id: UUID) -> list[BranchInfo]:
        leader = await self._get_leader(user_id)
        branches = await self.repo.get_by_leader(leader.id)
        return [BranchInfo.model_validate(b) for b in branches]
