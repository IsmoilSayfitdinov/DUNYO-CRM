from uuid import UUID

from fastapi import APIRouter, Depends, Query
from fastapi import status
from app.model.user import User
from app.schemas.attendance import AttendanceListResponse
from app.schemas.employee import EmployeeUpdate, EmployeeListResponse, EmployeeInfo, EmployeeCreate
from app.services.attendance_services import AttendanceService
from app.services.employee_services import EmployeeService
from app.core.dependencies import require_role, get_current_user
from app.enum.role import Role
from app.schemas.salary_history import SalaryHistoryInfo
from app.services.salary_history_services import SalaryHistoryServices

router = APIRouter(prefix="/employees", tags=["Employee"])

@router.get("/me", response_model=EmployeeInfo, dependencies=[Depends(require_role(Role.employee))])
async def my_profile(
    user: User = Depends(get_current_user),
    employeeServices: EmployeeService = Depends(),
):
    return await employeeServices.get_my_profile(user.id)


@router.get("/", response_model=EmployeeListResponse, dependencies=[Depends(require_role(Role.leader))])
async def get_all_employees(
    employeeServices: EmployeeService = Depends(),
    user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    branch_id: UUID | None = Query(None, description="Filial bo'yicha filter"),
):
    return await employeeServices.get_employees(caller=user, limit=limit, offset=offset, branch_id=branch_id)

@router.get("/{employee_id}", response_model=EmployeeInfo, dependencies=[Depends(require_role(Role.leader))])
async def get_employee_by_id(
    employee_id: UUID,
    employeeServices: EmployeeService = Depends(),
    user: User = Depends(get_current_user),
):
    return await employeeServices.get_employee_by_id(caller=user, id=employee_id)

@router.get("/{employee_id}/attendance", response_model=AttendanceListResponse, dependencies=[Depends(require_role(Role.leader))])
async def get_employee_attendance(
    employee_id: UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    year: int | None = Query(None, ge=2000, le=2100),
    month: int | None = Query(None, ge=1, le=12),
    attendanceServices: AttendanceService = Depends(),
    user: User = Depends(get_current_user)
):
    return await attendanceServices.get_employee_attendance(user.id, employee_id, limit, offset, year, month)

@router.get("/{employee_id}/salary-history", response_model=list[SalaryHistoryInfo], dependencies=[Depends(require_role(Role.leader))])
async def get_employee_salary_history(
    employee_id: UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    salaryHistoryServices: SalaryHistoryServices = Depends(),
    user: User = Depends(get_current_user),
):
    return await salaryHistoryServices.get_employee_salary(
        employee_id=employee_id,
        user_id=user.id,
        limit=limit,
        offset=offset
    )


@router.post("/", response_model=EmployeeInfo, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role(Role.leader))])
async def create_employee(
    data: EmployeeCreate,
    employeeServices: EmployeeService = Depends(),
    user: User = Depends(get_current_user),
):
    return await employeeServices.create(caller=user, data=data)

@router.patch("/{employee_id}", response_model=EmployeeInfo, dependencies=[Depends(require_role(Role.leader))])
async def update_employee(
    employee_id: UUID,
    data: EmployeeUpdate,
    employeeServices: EmployeeService = Depends(),
    user: User = Depends(get_current_user),
):
    return await employeeServices.update(caller=user, id=employee_id, data=data)


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_role(Role.leader))])
async def delete_employee(
    employee_id: UUID,
    employeeServices: EmployeeService = Depends(),
    user: User = Depends(get_current_user),
):
    await employeeServices.delete(caller=user, id=employee_id)

