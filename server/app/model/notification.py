from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.model.base import Base

if TYPE_CHECKING:
    from app.model.user import User


class Notification(Base):
    __tablename__ = "notifications"

    user_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(nullable=False)
    body: Mapped[str | None] = mapped_column(default=None)
    type: Mapped[str | None] = mapped_column(default=None)   # leave/salary/attendance/system
    link: Mapped[str | None] = mapped_column(default=None)   # ixtiyoriy: bosilganda o'tadigan yo'l
    is_read: Mapped[bool] = mapped_column(default=False, server_default="false", nullable=False)

    user: Mapped["User"] = relationship()
