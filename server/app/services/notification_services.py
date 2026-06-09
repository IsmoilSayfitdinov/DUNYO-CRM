import asyncio
from uuid import UUID

from fastapi import Depends

from app.core.push import send_web_push
from app.core.ws_manager import manager
from app.model.notification import Notification
from app.model.user_settings import UserSettings
from app.repositories.notification_repository import NotificationRepository
from app.repositories.push_subscription_repository import PushSubscriptionRepository
from app.repositories.user_settings_repository import UserSettingsRepository
from app.schemas.notification import NotificationInfo


# Bildirishnoma turi -> UserSettings dagi tegishli toggle nomi. Bu turlar uchun push
# foydalanuvchi sozlamasiga bo'ysunadi; boshqalari (masalan "system"/test) faqat
# master notify_push'ga bo'ysunadi.
_TYPE_TOGGLE = {
    "leave": "notify_leave",
    "salary": "notify_salary",
    "task": "notify_task",
    "attendance": "notify_attendance",
}


class NotificationService:
    def __init__(
        self,
        repo: NotificationRepository = Depends(),
        push_repo: PushSubscriptionRepository = Depends(),
        settings_repo: UserSettingsRepository = Depends(),
    ):
        self.repo = repo
        self.push_repo = push_repo
        self.settings_repo = settings_repo

    @staticmethod
    def _push_allowed(settings: UserSettings | None, type: str | None) -> bool:
        """Foydalanuvchi sozlamasiga ko'ra bu turdagi qurilma-push yuborilsinmi."""
        if settings is None:
            return True  # sozlama yo'q -> standart hammasi yoqilgan
        if not settings.notify_push:
            return False  # master push o'chiq
        toggle = _TYPE_TOGGLE.get(type or "")
        if toggle is None:
            return True  # tur uchun alohida toggle yo'q -> master yetarli
        return bool(getattr(settings, toggle, True))

    async def notify(
        self,
        user_id: UUID,
        title: str,
        body: str | None = None,
        type: str | None = None,
        link: str | None = None,
    ) -> Notification:
        """In-app bildirishnoma yaratadi, real-time yuboradi VA (sozlamaga ko'ra) qurilmaga push."""
        notif = await self.repo.create(Notification(
            user_id=user_id, title=title, body=body, type=type, link=link,
        ))
        # Real-time: ochiq WebSocket'larga darhol yuboramiz (har doim — bu in-app jonli)
        await manager.send_to_user(str(user_id), {
            "type": "notification",
            "id": str(notif.id),
            "title": title,
            "body": body or "",
            "link": link or "/",
        })
        # Qurilma push (brauzer yopiq bo'lsa ham) — foydalanuvchi sozlamasiga bo'ysunadi
        settings = await self.settings_repo.get_by_user_id(user_id)
        if self._push_allowed(settings, type):
            await self._push(user_id, title, body, link)
        return notif

    async def _push(self, user_id: UUID, title: str, body: str | None, link: str | None) -> None:
        subs = await self.push_repo.list_by_user(user_id)
        if not subs:
            return
        payload = {"title": title, "body": body or "", "url": link or "/"}
        for s in subs:
            info = {"endpoint": s.endpoint, "keys": {"p256dh": s.p256dh, "auth": s.auth}}
            # pywebpush sinxron — event loop'ni bloklamaslik uchun thread'da
            _sent, expired = await asyncio.to_thread(send_web_push, info, payload)
            if expired:
                await self.push_repo.delete_by_endpoint(s.endpoint)

    # ---------- o'qish / belgilash ----------

    async def get_my(self, user_id: UUID, limit: int = 50) -> list[NotificationInfo]:
        items = await self.repo.list_by_user(user_id, limit)
        return [NotificationInfo.model_validate(n) for n in items]

    async def unread_count(self, user_id: UUID) -> int:
        return await self.repo.unread_count(user_id)

    async def mark_read(self, notif_id: UUID, user_id: UUID) -> None:
        await self.repo.mark_read(notif_id, user_id)

    async def mark_all_read(self, user_id: UUID) -> int:
        return await self.repo.mark_all_read(user_id)
