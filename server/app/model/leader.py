from typing import TYPE_CHECKING

from app.model.base import Base

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Uuid

from uuid import UUID

if TYPE_CHECKING:
    from app.model.user import User
    from app.model.employee import Employee
    from app.model.branch import Branch

class Leader(Base):
    __tablename__ = "leaders"
    
    user_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
    )
    
    user: Mapped["User"] = relationship(back_populates="leader")
    employee: Mapped[list["Employee"]] = relationship(back_populates="leader")
    branches: Mapped[list["Branch"]] = relationship(back_populates="leader")
    
