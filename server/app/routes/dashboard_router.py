from fastapi import APIRouter, Depends, Query

from app.core.dependencies import get_current_user, require_role
from app.enum.role import Role
from app.model.user import User
from app.schemas.dashboard import ActivityItem, DashboardAlert, DashboardOverview, TopEmployeeItem
from app.services.dashboard_services import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=DashboardOverview, dependencies=[Depends(require_role(Role.leader))])
async def overview(
    period: str = Query("today", pattern="^(today|week|month)$"),
    user: User = Depends(get_current_user),
    dashboardService: DashboardService = Depends(),
):
    return await dashboardService.get_overview(user_id=user.id, period=period)


@router.get("/alerts", response_model=list[DashboardAlert], dependencies=[Depends(require_role(Role.leader))])
async def alerts(
    user: User = Depends(get_current_user),
    dashboardService: DashboardService = Depends(),
):
    return await dashboardService.get_alerts(user_id=user.id)


@router.get("/activity", response_model=list[ActivityItem], dependencies=[Depends(require_role(Role.leader))])
async def activity(
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    dashboardService: DashboardService = Depends(),
):
    return await dashboardService.get_activity(user_id=user.id, limit=limit)


@router.get("/top-employees", response_model=list[TopEmployeeItem], dependencies=[Depends(require_role(Role.leader))])
async def top_employees(
    limit: int = Query(5, ge=1, le=50),
    user: User = Depends(get_current_user),
    dashboardService: DashboardService = Depends(),
):
    return await dashboardService.get_top_employees(user_id=user.id, limit=limit)
