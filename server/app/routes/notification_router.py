from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import get_current_user
from app.model.user import User
from app.schemas.notification import NotificationInfo
from app.services.notification_services import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/me", response_model=list[NotificationInfo])
async def my_notifications(
    user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100),
    service: NotificationService = Depends(),
):
    return await service.get_my(user.id, limit)


@router.get("/me/unread-count")
async def unread_count(
    user: User = Depends(get_current_user),
    service: NotificationService = Depends(),
):
    return {"count": await service.unread_count(user.id)}


@router.patch("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_read(
    notification_id: UUID,
    user: User = Depends(get_current_user),
    service: NotificationService = Depends(),
):
    await service.mark_read(notification_id, user.id)


@router.post("/read-all")
async def mark_all_read(
    user: User = Depends(get_current_user),
    service: NotificationService = Depends(),
):
    return {"updated": await service.mark_all_read(user.id)}
