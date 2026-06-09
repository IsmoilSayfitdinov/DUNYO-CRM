from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.model.base import Base

if TYPE_CHECKING:
    from app.model.user import User


class UserSettings(Base):
    __tablename__ = "user_settings"

    user_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), unique=True, nullable=False
    )

    # Bildirishnoma (leader: sms; xodim: push/task; ikkalasi: leave/salary)
    notify_sms: Mapped[bool] = mapped_column(default=False, server_default="false")
    notify_push: Mapped[bool] = mapped_column(default=True, server_default="true")
    notify_leave: Mapped[bool] = mapped_column(default=True, server_default="true")
    notify_salary: Mapped[bool] = mapped_column(default=True, server_default="true")
    notify_task: Mapped[bool] = mapped_column(default=True, server_default="true")
    notify_attendance: Mapped[bool] = mapped_column(default=True, server_default="true")

    # Xavfsizlik
    two_factor_enabled: Mapped[bool] = mapped_column(default=False, server_default="false")
    auto_logout: Mapped[bool] = mapped_column(default=True, server_default="true")

    user: Mapped["User"] = relationship()
