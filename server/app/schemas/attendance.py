from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from app.core.timezone import to_utc_from_local
from app.enum.attendance_status import AttendanceStatus
from pydantic import BaseModel, ConfigDict, Field, model_validator

class AttendanceInfo(BaseModel):
    id: UUID
    employee_id: UUID
    status: AttendanceStatus
    work_date: date

    check_in: datetime | None = None
    check_out: datetime | None = None
    is_late: bool = False

    duration_hours: float | None = None
    earned_amount: Decimal | None = Field(None, max_digits=10, examples=["15000.00"])
    notes: str | None = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AttendanceUpdate(BaseModel):
    status: AttendanceStatus | None = None
    check_in: datetime | None = None
    check_out: datetime | None = None
    notes: str | None= None

    @model_validator(mode="after")
    def _check_times(self):
        # Rahbar formasidan kelgan vaqtlar naive (timezone'siz) bo'lishi mumkin —
        # ularni darrov UTC'ga normallashtiramiz (5 soat siljish + 500 xatosi oldini olish).
        if self.check_in:
            self.check_in = to_utc_from_local(self.check_in)
        if self.check_out:
            self.check_out = to_utc_from_local(self.check_out)

        # check_out check_in'dan oldin bo'lmasligi kerak (manfiy soat/pulning oldini olish)
        if self.check_in and self.check_out and self.check_out < self.check_in:
            raise ValueError("check_out check_in'dan oldin bo'lishi mumkin emas !")
        return self

class AttendanceListResponse(BaseModel):
    items: list[AttendanceInfo]
    total: int
    limit: int
    offset: int


class ScanRequest(BaseModel):
    notes: str | None = None
    branch_id: UUID          # QR'dan o'qilgan filial ID
    # Koordinatalar oddiy float. Geo-fence'ni NaN/Infinity bilan chetlab o'tishning
    # oldini olish service qatlamida (math.isfinite + diapazon) toza HTTPException
    # bilan amalga oshiriladi — pydantic xatosi NaN'ni javobga qaytarib serialize
    # qila olmasligi (starlette allow_nan=False) sababli 500 bermaslik uchun.
    latitude: float          # qurilma GPS
    longitude: float


class AttendanceTrendItem(BaseModel):
    date: date
    present: int
    late: int
    absent: int


class WeeklyAttendanceItem(BaseModel):
    week: str = Field(..., examples=["W1"])
    hours: float = Field(..., examples=[42.5])
    days: int = Field(..., examples=[5])


class AttendanceReportRow(BaseModel):
    """Oylik davomat hisoboti — har xodim bo'yicha bitta qator."""
    employee_id: UUID
    employee_name: str
    present: int      # kelgan kunlar (kelgan + ketgan)
    late: int         # kechikib kelganlar
    on_time: int      # o'z vaqtida
    total: int        # jami yozuvlar
    