from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class SessionInfo(BaseModel):
    id: UUID
    device: str            # User-Agent'dan olingan o'qiladigan nom (masalan "iPhone · Safari")
    ip_address: str | None = None
    last_used_at: datetime
    created_at: datetime
    is_current: bool = False
