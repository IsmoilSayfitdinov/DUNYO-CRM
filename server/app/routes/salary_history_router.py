from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.enum.role import Role
from app.model.user import User
from app.schemas.salary_history import SalaryHistoryInfo, SalaryAdjustRequest, SalarySummary, SalaryTrendItem, SalaryWithEmployeeInfo
from app.schemas.salary_adjustment import SalaryAdjustmentCreate, SalaryAdjustmentInfo, SalaryAdjustmentWithEmployee
from app.core.dependencies import get_current_user, require_role
from app.services.salary_history_services import SalaryHistoryServices

router = APIRouter(prefix="/salary-history", tags=["Salary History"])


@router.get("/me",
    response_model=list[SalaryHistoryInfo],
    dependencies=[Depends(require_role(Role.employee))]
)
async def get_my_salary(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    salaryHistoryServices: SalaryHistoryServices = Depends(),
    user: User = Depends(get_current_user)
):
    return await salaryHistoryServices.get_my_salary_history(
        user_id=user.id,
        limit=limit,
        offset=offset
    )


@router.get("/summary", response_model=SalarySummary, dependencies=[Depends(require_role(Role.leader))])
async def summary(
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    user: User = Depends(get_current_user),
    salaryHistoryServices: SalaryHistoryServices = Depends(),
):
    return await salaryHistoryServices.get_salary_summary(user_id=user.id, year=year, month=month)
    
@router.post(
    "/{employee_id}/pay",
    dependencies=[Depends(require_role(Role.leader))],
    response_model=SalaryHistoryInfo
)
async def pay(
    employee_id: UUID,
    salary_id: UUID,
    user: User = Depends(get_current_user),
    salaryHistoryServices: SalaryHistoryServices = Depends(),
):
    return await salaryHistoryServices.paid(
        employee_id=employee_id,
        user_id=user.id,
        salary_id=salary_id
    )
    
@router.post("/{employee_id}/calculate", response_model=SalaryHistoryInfo, dependencies=[Depends(require_role(Role.leader))])
async def calculate(
    employee_id: UUID,
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    user: User = Depends(get_current_user),
    salaryHistoryServices: SalaryHistoryServices = Depends(),
):
    return await salaryHistoryServices.calculate_salary(
        employee_id=employee_id,
        user_id=user.id,
        year=year,
        month=month
    )


@router.patch("/{salary_id}/adjust", response_model=SalaryHistoryInfo, dependencies=[Depends(require_role(Role.leader))])
async def adjust(
    salary_id: UUID,
    data: SalaryAdjustRequest,
    user: User = Depends(get_current_user),
    salaryHistoryServices: SalaryHistoryServices = Depends(),
):
    return await salaryHistoryServices.adjust_salary(
        user_id=user.id,
        salary_id=salary_id,
        bonus=data.bonus,
        note=data.note,
    )
    
# ---------- AVANS / PREMIYA (itemized) ----------

@router.post("/adjustment", response_model=SalaryAdjustmentInfo, dependencies=[Depends(require_role(Role.leader))])
async def give_adjustment(
    data: SalaryAdjustmentCreate,
    user: User = Depends(get_current_user),
    salaryHistoryServices: SalaryHistoryServices = Depends(),
):
    """Avans yoki premiya berish — oylik hisoblanmasa ham."""
    return await salaryHistoryServices.give_adjustment(user_id=user.id, data=data)


@router.get("/adjustments/all", response_model=list[SalaryAdjustmentWithEmployee], dependencies=[Depends(require_role(Role.leader))])
async def list_team_adjustments(
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    user: User = Depends(get_current_user),
    salaryHistoryServices: SalaryHistoryServices = Depends(),
):
    """Rahbar: barcha xodimlarning shu oydagi avans/premiyalari (sahifada ko'rinadi)."""
    return await salaryHistoryServices.list_team_adjustments(user_id=user.id, year=year, month=month)


@router.get("/adjustments", response_model=list[SalaryAdjustmentInfo], dependencies=[Depends(require_role(Role.leader))])
async def list_adjustments(
    employee_id: UUID = Query(...),
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    user: User = Depends(get_current_user),
    salaryHistoryServices: SalaryHistoryServices = Depends(),
):
    """Rahbar: bitta xodimning oy bo'yicha avans/premiya ro'yxati."""
    return await salaryHistoryServices.list_adjustments(
        user_id=user.id, employee_id=employee_id, year=year, month=month
    )


@router.get("/me/adjustments", response_model=list[SalaryAdjustmentInfo], dependencies=[Depends(require_role(Role.employee))])
async def my_adjustments(
    limit: int = Query(100, ge=1, le=200),
    user: User = Depends(get_current_user),
    salaryHistoryServices: SalaryHistoryServices = Depends(),
):
    """Xodim: o'zining avans/premiya tarixi."""
    return await salaryHistoryServices.my_adjustments(user_id=user.id, limit=limit)


@router.get("/", response_model=list[SalaryWithEmployeeInfo], dependencies=[Depends(require_role(Role.leader))])
async def get_all_salary(
    user: User = Depends(get_current_user),
    year: int = Query(None, ge=2000, le=2100),
    month: int = Query(None, ge=1, le=12),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    salaryHistoryServices: SalaryHistoryServices = Depends(),
):
    return await salaryHistoryServices.get_salarys_list(
        user_id=user.id,
        year=year,
        month=month,
        limit=limit,
        offset=offset
    )
    
@router.get("/trend", response_model=list[SalaryTrendItem], dependencies=[Depends(require_role(Role.leader))])
async def salary_trend(
    user: User = Depends(get_current_user),
    salaryHistoryServices: SalaryHistoryServices = Depends(),
):
    return await salaryHistoryServices.get_salary_trend(user.id)