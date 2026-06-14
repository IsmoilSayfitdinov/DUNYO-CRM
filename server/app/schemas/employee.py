from datetime import datetime, time
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user_info import UserInfo


class EmployeeCreate(BaseModel):
    # User fields
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)
    first_name: str = Field(..., min_length=1, max_length=128)
    last_name: str = Field(..., min_length=1, max_length=128)
    phone: str | None = Field(None, min_length=13, max_length=13)

    # Employee profile fields
    # Oddiy rahbar uchun e'tiborga olinmaydi (o'ziga biriktiriladi);
    # faqat superuser boshqa rahbarga yaratganda kerak bo'ladi.
    leader_user_id: UUID | None = None
    branch_id: UUID | None = None
    position: str | None = None
    shift_start: time | None = None
    shift_end: time | None = None
    shift_number: int = Field(default=1, ge=1)
    hourly_rate: Decimal = Field(default=Decimal("12000.00"), ge=0)


class MyProfileUpdate(BaseModel):
    """Xodim O'ZINI tahrirlashi uchun — faqat shaxsiy User maydonlari.
    Maosh, rol, smena, faollik kabi maydonlar BU YERDA YO'Q (mass-assignment'dan
    himoya): xodim ularni o'zgartira olmaydi, faqat rahbar EmployeeUpdate orqali."""
    first_name: str | None = Field(None, min_length=1, max_length=128)
    last_name: str | None = Field(None, min_length=1, max_length=128)
    username: str | None = Field(None, min_length=3, max_length=50)
    phone: str | None = Field(None, min_length=13, max_length=13)


class EmployeeUpdate(BaseModel):
    # User fields
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    phone: str | None = None

    # Employee profile fields
    nfc_uid: str| None = None
    is_active: bool | None = None
    leader_user_id: UUID | None = None
    branch_id: UUID | None = None
    position: str | None = None
    shift_start: time | None = None
    shift_end: time | None = None
    shift_number: int | None = None
    hourly_rate: Decimal | None = None


class EmployeeInfo(BaseModel):
    id: UUID
    user_id: UUID
    leader_id: UUID
    branch_id: UUID | None = None
    user: UserInfo
    is_active: bool
    position: str | None = None
    shift_start: time | None = None
    shift_end: time | None = None
    shift_number: int
    nfc_uid: str| None = None
    hourly_rate: Decimal = Field(..., max_digits=10, decimal_places=2, examples=["15000.00"])
    score: int = Field(0, le=100, ge=0, examples=[100])
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EmployeeListResponse(BaseModel):
    items: list[EmployeeInfo]
    total: int
    limit: int
    offset: int