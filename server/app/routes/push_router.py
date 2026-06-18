from fastapi import APIRouter, Depends

from app.core.config import setting
from app.core.dependencies import get_current_user
from app.model.user import User
from app.repositories.push_subscription_repository import PushSubscriptionRepository
from app.schemas.push import PushSubscriptionIn, PushUnsubscribeIn
from app.services.notification_services import NotificationService

router = APIRouter(prefix="/push", tags=["Push"])


@router.get("/vapid-public-key")
async def vapid_public_key():
    return {"public_key": setting.VAPID_PUBLIC_KEY}


@router.post("/subscribe", status_code=201)
async def subscribe(
    data: PushSubscriptionIn,
    user: User = Depends(get_current_user),
    repo: PushSubscriptionRepository = Depends(),
):
    await repo.upsert(
        user_id=user.id,
        endpoint=data.endpoint,
        p256dh=data.keys.p256dh,
        auth=data.keys.auth,
    )
    return {"ok": True}


@router.post("/unsubscribe", status_code=200)
async def unsubscribe(
    data: PushUnsubscribeIn,
    user: User = Depends(get_current_user),
    repo: PushSubscriptionRepository = Depends(),
):
    await repo.delete_by_endpoint(data.endpoint, user_id=user.id)
    return {"ok": True}


@router.post("/test", status_code=200)
async def test_push(
    user: User = Depends(get_current_user),
    notif: NotificationService = Depends(),
):
    """Joriy foydalanuvchiga sinov bildirishnomasi: in-app + real-time + qurilma push.
    Push to'g'ri sozlanganini tekshirish uchun (ta'til so'rovi kutmasdan)."""
    await notif.notify(
        user.id,
        title="Test bildirishnoma 🔔",
        body="Tabriklaymiz — push va real-time bildirishnoma ishlayapti!",
        type="system",
        link="/",
    )
    return {"ok": True}
