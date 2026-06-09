from typing import Optional, TYPE_CHECKING

from app.model.base import Base
from app.enum.role import Role

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum

if TYPE_CHECKING:
    from app.model.employee import Employee
    from app.model.leader import Leader

class User(Base):
    __tablename__ = "users"
    
    first_name: Mapped[str | None] = mapped_column(nullable=True)
    last_name: Mapped[str | None] = mapped_column(nullable=True)
    phone: Mapped[str | None] = mapped_column(nullable=True)
    username: Mapped[str] = mapped_column(unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, server_default="true")

    role: Mapped[Role] = mapped_column(
        Enum(Role, name="role"),
        default=Role.employee,
        nullable=False
    )
    
    leader: Mapped[Optional["Leader"]] = relationship(back_populates="user")
    employee: Mapped[Optional["Employee"]] = relationship(back_populates="user")
    
    
