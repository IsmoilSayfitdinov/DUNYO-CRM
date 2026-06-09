from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.model.base import Base

if TYPE_CHECKING:
    from app.model.user import User


class PushSubscription(Base):
    """Brauzer Web Push obunasi (qurilma bo'yicha)."""

    __tablename__ = "push_subscriptions"

    user_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), nullable=False, index=True
    )

    endpoint: Mapped[str] = mapped_column(unique=True, nullable=False)
    p256dh: Mapped[str] = mapped_column(nullable=False)
    auth: Mapped[str] = mapped_column(nullable=False)

    user: Mapped["User"] = relationship()
