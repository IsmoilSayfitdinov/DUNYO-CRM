from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NotificationInfo(BaseModel):
    id: UUID
    title: str
    body: str | None = None
    type: str | None = None
    link: str | None = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
