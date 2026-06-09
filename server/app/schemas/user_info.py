from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.enum.role import Role

class UserInfo(BaseModel):
    id: UUID
    
    first_name: str | None
    last_name: str | None
    phone: str | None
    username: str
    role: Role
    is_active: bool = True

    created_at: datetime | None
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)

