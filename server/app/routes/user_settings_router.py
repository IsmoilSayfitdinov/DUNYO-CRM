from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.model.user import User
from app.schemas.user_settings import UserSettingsInfo, UserSettingsUpdate
from app.services.user_settings_services import UserSettingsService

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/me", response_model=UserSettingsInfo)
async def get_my_settings(
    user: User = Depends(get_current_user),
    userSettingsService: UserSettingsService = Depends(),
):
    return await userSettingsService.get_my_settings(user.id)


@router.patch("/me", response_model=UserSettingsInfo)
async def update_my_settings(
    data: UserSettingsUpdate,
    user: User = Depends(get_current_user),
    userSettingsService: UserSettingsService = Depends(),
):
    return await userSettingsService.update_my_settings(user.id, data)
