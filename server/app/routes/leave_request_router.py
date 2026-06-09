from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import get_current_user, require_role
from app.enum.leave_request_status import LeaveRequestStatus
from app.enum.role import Role
from app.model.user import User
from app.schemas.leave_request import LeaveRequestCreate, LeaveRequestInfo, LeaveRejectRequest
from app.services.leave_request_services import LeaveRequestService

router = APIRouter(prefix="/leave-requests", tags=["Leave Requests"])


# ---------- Xodim ----------

@router.post("/", response_model=LeaveRequestInfo, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role(Role.employee))])
async def create_leave_request(
    data: LeaveRequestCreate,
    user: User = Depends(get_current_user),
    service: LeaveRequestService = Depends(),
):
    return await service.create(user_id=user.id, data=data)


@router.get("/me", response_model=list[LeaveRequestInfo], dependencies=[Depends(require_role(Role.employee))])
async def my_leave_requests(
    user: User = Depends(get_current_user),
    service: LeaveRequestService = Depends(),
):
    return await service.get_my(user_id=user.id)


# ---------- Rahbar ----------

@router.get("/", response_model=list[LeaveRequestInfo], dependencies=[Depends(require_role(Role.leader))])
async def team_leave_requests(
    user: User = Depends(get_current_user),
    status_filter: LeaveRequestStatus | None = Query(None, alias="status"),
    service: LeaveRequestService = Depends(),
):
    return await service.get_for_leader(user_id=user.id, status_filter=status_filter)


@router.patch("/{leave_id}/approve", response_model=LeaveRequestInfo, dependencies=[Depends(require_role(Role.leader))])
async def approve_leave_request(
    leave_id: UUID,
    user: User = Depends(get_current_user),
    service: LeaveRequestService = Depends(),
):
    return await service.approve(user_id=user.id, leave_id=leave_id)


@router.patch("/{leave_id}/reject", response_model=LeaveRequestInfo, dependencies=[Depends(require_role(Role.leader))])
async def reject_leave_request(
    leave_id: UUID,
    data: LeaveRejectRequest,
    user: User = Depends(get_current_user),
    service: LeaveRequestService = Depends(),
):
    return await service.reject(user_id=user.id, leave_id=leave_id, reason=data.reason)
