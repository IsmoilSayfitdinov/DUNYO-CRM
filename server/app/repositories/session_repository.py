from datetime import datetime
from uuid import UUID

from sqlalchemy import select, update

from app.core.timezone import ensure_aware, now_utc
from app.db.database import SessionsDep
from app.model.session import Session


class SessionRepository:
    def __init__(self, database: SessionsDep):
        self.database = database

    async def create(self, session: Session) -> Session:
        self.database.add(session)
        await self.database.commit()
        await self.database.refresh(session)
        return session

    async def get_by_id(self, id: UUID) -> Session | None:
        return await self.database.scalar(select(Session).where(Session.id == id))

    async def list_active_by_user(self, user_id: UUID) -> list[Session]:
        query = (
            select(Session)
            .where(Session.user_id == user_id)
            .where(Session.revoked.is_(False))
            .order_by(Session.last_used_at.desc())
        )
        result = await self.database.scalars(query)
        # Muddati o'tganlarni Python'da filtrlaymiz (naive/aware DB farqlaridan xoli).
        now = now_utc()
        return [s for s in result if ensure_aware(s.expires_at) > now]

    async def touch(self, id: UUID, ip: str | None, user_agent: str | None) -> None:
        await self.database.execute(
            update(Session)
            .where(Session.id == id)
            .values(last_used_at=now_utc(), ip_address=ip, user_agent=user_agent)
        )
        await self.database.commit()

    async def revoke(self, id: UUID) -> int:
        result = await self.database.execute(
            update(Session).where(Session.id == id, Session.revoked.is_(False)).values(revoked=True)
        )
        await self.database.commit()
        return result.rowcount

    async def revoke_all_for_user(self, user_id: UUID, except_id: UUID | None = None) -> int:
        query = update(Session).where(Session.user_id == user_id, Session.revoked.is_(False))
        if except_id is not None:
            query = query.where(Session.id != except_id)
        result = await self.database.execute(query.values(revoked=True))
        await self.database.commit()
        return result.rowcount
