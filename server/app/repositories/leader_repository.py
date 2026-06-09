from uuid import UUID

from sqlalchemy import select

from app.db.database import SessionsDep
from app.model.leader import Leader

class LeaderRepository:
    def __init__(self, database: SessionsDep):
        self.database = database
        
    async def get_by_id(self, id: UUID) -> Leader | None:
        query = select(Leader).where(Leader.id == id)
        return await self.database.scalar(query)
    
    
    async def get_by_user_id(self, user_id: UUID) -> Leader | None:
        query = select(Leader).where(Leader.user_id == user_id)
        return await self.database.scalar(query)
