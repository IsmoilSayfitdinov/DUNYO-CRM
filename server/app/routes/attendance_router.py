from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from app.core.dependencies import get_current_user, require_role
from app.enum.role import Role
from app.model.user import User
from app.schemas.attendance import AttendanceListResponse, AttendanceUpdate,  AttendanceInfo, ScanRequest, AttendanceTrendItem, WeeklyAttendanceItem, AttendanceReportRow
from app.services.attendance_services import AttendanceService

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get("/report", response_model=list[AttendanceReportRow], dependencies=[Depends(require_role(Role.leader))])
async def attendance_report(
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    user: User = Depends(get_current_user),
    attendanceService: AttendanceService = Depends(),
):
    """Rahbar: oylik davomat hisoboti (har xodim bo'yicha kelgan/kechikkan/jami)."""
    return await attendanceService.attendance_report(user_id=user.id, year=year, month=month)

@router.post("/scan", response_model=AttendanceInfo, dependencies=[Depends(require_role(Role.employee))])
async def scan(
    data: ScanRequest,
    user: User = Depends(get_current_user),
    attendanceService: AttendanceService = Depends(),
):
    return await attendanceService.scan(user_id=user.id, data=data)

@router.post("/nfc", response_model=AttendanceInfo)
async def nfc_scan(
    nfc_uid: str,
    attendanceService: AttendanceService = Depends(),
):
    return await attendanceService.nfc(nfc_uid=nfc_uid)



@router.get("/me", response_model=AttendanceListResponse, dependencies=[Depends(require_role(Role.employee))])
async def get_my_attendance(
    attendanceService: AttendanceService = Depends(),
    user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    year: int | None = Query(None, ge=2000, le=2100),
    month: int | None = Query(None, ge=1, le=12),
) -> AttendanceListResponse:
    
    return await attendanceService.get_my_attendance(user_id=user.id, limit=limit, offset=offset, year=year, month=month)

@router.get("/me/weekly", response_model=list[WeeklyAttendanceItem], dependencies=[Depends(require_role(Role.employee))])
async def get_my_weekly(
    attendanceService: AttendanceService = Depends(),
    user: User = Depends(get_current_user),
    year: int | None = Query(None, ge=2000, le=2100),
    month: int | None = Query(None, ge=1, le=12),
) -> list[WeeklyAttendanceItem]:

    return await attendanceService.get_my_weekly(user_id=user.id, year=year, month=month)


@router.get("/team", response_model=list[AttendanceInfo], dependencies=[Depends(require_role(Role.leader))])
async def get_today_team(
    work_date: date | None = None,
    attendanceService: AttendanceService = Depends(),
    user: User = Depends(get_current_user),
) -> list[AttendanceInfo]:
    
    return await attendanceService.get_today_team(user_id=user.id, work_date=work_date)


@router.get("/analytics/trends", response_model=list[AttendanceTrendItem], dependencies=[Depends(require_role(Role.leader))])
async def attendance_trends(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    attendanceService: AttendanceService = Depends(),
    user: User = Depends(get_current_user),
):
    return await attendanceService.get_attendance_trend(user.id, start_date, end_date)


@router.patch("/{attendance_id}", response_model=AttendanceInfo, dependencies=[Depends(require_role(Role.leader))])
async def update(
    data: AttendanceUpdate,
    attendance_id: UUID,
    attendanceService: AttendanceService = Depends(),
    user: User = Depends(get_current_user),
) -> AttendanceInfo:
    
    return await attendanceService.update(attendance_id=attendance_id, user_id=user.id, data=data)