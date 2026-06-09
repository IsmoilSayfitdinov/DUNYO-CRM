from uuid import UUID

from sqlalchemy import select

from app.db.database import SessionsDep
from app.model.user_settings import UserSettings


class UserSettingsRepository:
    def __init__(self, database: SessionsDep):
        self.database = database

    async def get_by_user_id(self, user_id: UUID) -> UserSettings | None:
        query = select(UserSettings).where(UserSettings.user_id == user_id)
        return await self.database.scalar(query)

    async def create(self, settings: UserSettings) -> UserSettings:
        self.database.add(settings)
        await self.database.commit()
        await self.database.refresh(settings)
        return settings

    async def update(self, settings: UserSettings) -> UserSettings:
        await self.database.commit()
        await self.database.refresh(settings)
        return settings
