from decimal import Decimal

from app.enum.attendance_status import AttendanceStatus
from app.schemas.attendance import AttendanceInfo

MAX_SHIFT_HOURS = Decimal("16")

def worked_hours(attendance: AttendanceInfo):
    
    if (
        attendance.status == AttendanceStatus.absent
        or attendance.status == AttendanceStatus.leave
    ):
        return Decimal("0")
    
    if not attendance.check_in or not attendance.check_out:
        return Decimal("0")
    
    duration = int((attendance.check_out - attendance.check_in).total_seconds())
    hours = min(Decimal(duration) / Decimal(3600), MAX_SHIFT_HOURS)
    
    return hours
    