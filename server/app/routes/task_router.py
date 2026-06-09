from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user, require_role
from app.enum.role import Role
from app.model.user import User
from app.schemas.task import TaskCreate, TaskInfo, TaskStatusUpdate, TaskWithEmployee
from app.services.task_services import TaskServices

router = APIRouter(prefix="/tasks", tags=["Tasks"])


# ---------- RAHBAR ----------

@router.post("", response_model=TaskInfo, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(Role.leader))])
async def create_task(
    data: TaskCreate,
    user: User = Depends(get_current_user),
    service: TaskServices = Depends(),
):
    """Rahbar xodimga vazifa yaratadi."""
    return await service.create_task(user_id=user.id, data=data)


@router.get("", response_model=list[TaskWithEmployee],
            dependencies=[Depends(require_role(Role.leader))])
async def list_team_tasks(
    user: User = Depends(get_current_user),
    service: TaskServices = Depends(),
):
    """Rahbar: o'zi yaratgan barcha vazifalar."""
    return await service.list_team_tasks(user_id=user.id)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role(Role.leader))])
async def delete_task(
    task_id: UUID,
    user: User = Depends(get_current_user),
    service: TaskServices = Depends(),
):
    """Rahbar o'z vazifasini o'chiradi."""
    await service.delete_task(user_id=user.id, task_id=task_id)


# ---------- XODIM ----------

@router.get("/me", response_model=list[TaskInfo],
            dependencies=[Depends(require_role(Role.employee))])
async def my_tasks(
    user: User = Depends(get_current_user),
    service: TaskServices = Depends(),
):
    """Xodim: o'ziga biriktirilgan vazifalar."""
    return await service.my_tasks(user_id=user.id)


@router.patch("/{task_id}/status", response_model=TaskInfo,
              dependencies=[Depends(require_role(Role.employee))])
async def update_status(
    task_id: UUID,
    data: TaskStatusUpdate,
    user: User = Depends(get_current_user),
    service: TaskServices = Depends(),
):
    """Xodim vazifa holatini o'zgartiradi."""
    return await service.update_status(user_id=user.id, task_id=task_id, new_status=data.status)
