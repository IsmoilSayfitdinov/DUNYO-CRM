from uuid import UUID

from sqlalchemy import delete, select

from app.db.database import SessionsDep
from app.model.push_subscription import PushSubscription


class PushSubscriptionRepository:
    def __init__(self, database: SessionsDep):
        self.database = database

    async def upsert(self, user_id: UUID, endpoint: str, p256dh: str, auth: str) -> None:
        """Endpoint bo'yicha obunani saqlaydi (bor bo'lsa yangilaydi)."""
        existing = await self.database.scalar(
            select(PushSubscription).where(PushSubscription.endpoint == endpoint)
        )
        if existing:
            existing.user_id = user_id
            existing.p256dh = p256dh
            existing.auth = auth
        else:
            self.database.add(PushSubscription(
                user_id=user_id, endpoint=endpoint, p256dh=p256dh, auth=auth,
            ))
        await self.database.commit()

    async def list_by_user(self, user_id: UUID) -> list[PushSubscription]:
        result = await self.database.scalars(
            select(PushSubscription).where(PushSubscription.user_id == user_id)
        )
        return list(result)

    async def delete_by_endpoint(self, endpoint: str) -> None:
        await self.database.execute(
            delete(PushSubscription).where(PushSubscription.endpoint == endpoint)
        )
        await self.database.commit()
