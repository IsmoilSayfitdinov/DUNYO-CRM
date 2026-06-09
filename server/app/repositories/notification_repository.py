from uuid import UUID

from sqlalchemy import func, select, update

from app.db.database import SessionsDep
from app.model.notification import Notification


class NotificationRepository:
    def __init__(self, database: SessionsDep):
        self.database = database

    async def create(self, notif: Notification) -> Notification:
        self.database.add(notif)
        await self.database.commit()
        await self.database.refresh(notif)
        return notif

    async def list_by_user(self, user_id: UUID, limit: int = 50) -> list[Notification]:
        query = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        result = await self.database.scalars(query)
        return list(result)

    async def unread_count(self, user_id: UUID) -> int:
        result = await self.database.scalar(
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user_id)
            .where(Notification.is_read.is_(False))
        )
        return result or 0

    async def mark_read(self, notif_id: UUID, user_id: UUID) -> int:
        result = await self.database.execute(
            update(Notification)
            .where(Notification.id == notif_id, Notification.user_id == user_id)
            .values(is_read=True)
        )
        await self.database.commit()
        return result.rowcount

    async def mark_all_read(self, user_id: UUID) -> int:
        result = await self.database.execute(
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            .values(is_read=True)
        )
        await self.database.commit()
        return result.rowcount
