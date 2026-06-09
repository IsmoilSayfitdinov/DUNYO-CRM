from uuid import UUID

from sqlalchemy import delete, select

from app.db.database import SessionsDep
from app.model.user import User


class UserRepository:
    def __init__(self, database: SessionsDep):
        self.database = database

    async def get_user_by_username(self, username: str) -> User | None:
        query = select(User).where(User.username == username)
        return await self.database.scalar(query)

    async def get_user_by_id(self, id: UUID) -> User | None:
        query = select(User).where(User.id == id)
        return await self.database.scalar(query)

    async def create(self, user: User) -> User:
        self.database.add(user)
        await self.database.commit()
        await self.database.refresh(user)
        return user

    async def delete(self, id: UUID) -> None:
        await self.database.execute(
            delete(User).where(User.id == id)
        )
        await self.database.commit()