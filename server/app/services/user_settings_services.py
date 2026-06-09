from uuid import UUID

from fastapi import Depends

from app.model.user_settings import UserSettings
from app.repositories.user_settings_repository import UserSettingsRepository
from app.schemas.user_settings import UserSettingsInfo, UserSettingsUpdate


class UserSettingsService:
    def __init__(self, repo: UserSettingsRepository = Depends()):
        self.repo = repo

    async def _get_or_create(self, user_id: UUID) -> UserSettings:
        # Sozlama yo'q bo'lsa — default qiymatlar bilan yaratiladi
        settings = await self.repo.get_by_user_id(user_id)
        if not settings:
            settings = await self.repo.create(UserSettings(user_id=user_id))
        return settings

    async def get_my_settings(self, user_id: UUID) -> UserSettingsInfo:
        settings = await self._get_or_create(user_id)
        return UserSettingsInfo.model_validate(settings)

    async def update_my_settings(self, user_id: UUID, data: UserSettingsUpdate) -> UserSettingsInfo:
        settings = await self._get_or_create(user_id)

        fields = data.model_dump(exclude_unset=True)
        for field, value in fields.items():
            setattr(settings, field, value)

        await self.repo.update(settings)
        return UserSettingsInfo.model_validate(settings)
