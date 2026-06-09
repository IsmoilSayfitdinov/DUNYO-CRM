from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.model.base import Base

if TYPE_CHECKING:
    from app.model.user import User


class Session(Base):
    """Foydalanuvchi sessiyasi (refresh token = sessiya). Faol qurilmalarni
    ko'rsatish va ularni chiqarish (revoke) uchun. Sessiya id'si tokenlardagi jti.
    """

    __tablename__ = "sessions"

    user_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), nullable=False, index=True
    )

    user_agent: Mapped[str | None] = mapped_column(default=None)
    ip_address: Mapped[str | None] = mapped_column(default=None)

    last_used_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    revoked: Mapped[bool] = mapped_column(default=False, server_default="false", nullable=False)

    user: Mapped["User"] = relationship()
