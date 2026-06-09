from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.model.base import Base

if TYPE_CHECKING:
    from app.model.employee import Employee
    from app.model.leader import Leader


class Branch(Base):
    __tablename__ = "branches"

    name: Mapped[str] = mapped_column(nullable=False)

    latitude: Mapped[float] = mapped_column(nullable=False)
    longitude: Mapped[float] = mapped_column(nullable=False)
    radius_meters: Mapped[int] = mapped_column(default=150, server_default="150")

    leader_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("leaders.id"),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(default=True, server_default="true")

    leader: Mapped["Leader"] = relationship(back_populates="branches")
    employees: Mapped[list["Employee"]] = relationship(back_populates="branch")
