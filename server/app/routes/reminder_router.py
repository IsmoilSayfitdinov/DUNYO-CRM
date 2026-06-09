from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import get_current_user, require_role
from app.enum.role import Role
from app.model.user import User
from app.schemas.reminder import ReminderCreate, ReminderInfo, ReminderWithEmployee
from app.services.reminder_services import ReminderServices

router = APIRouter(prefix="/reminders", tags=["Reminders"])


# ---------- RAHBAR ----------

@router.post("", response_model=ReminderInfo, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(Role.leader))])
async def create_reminder(
    data: ReminderCreate,
    user: User = Depends(get_current_user),
    service: ReminderServices = Depends(),
):
    """Rahbar xodimga eslatma/ogohlantirish yuboradi."""
    return await service.create_reminder(user_id=user.id, data=data)


@router.get("", response_model=list[ReminderWithEmployee],
            dependencies=[Depends(require_role(Role.leader))])
async def list_team_reminders(
    user: User = Depends(get_current_user),
    service: ReminderServices = Depends(),
):
    """Rahbar: o'zi yuborgan barcha eslatmalar."""
    return await service.list_team_reminders(user_id=user.id)


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role(Role.leader))])
async def delete_reminder(
    reminder_id: UUID,
    user: User = Depends(get_current_user),
    service: ReminderServices = Depends(),
):
    """Rahbar o'z eslatmasini o'chiradi."""
    await service.delete_reminder(user_id=user.id, reminder_id=reminder_id)


# ---------- XODIM ----------

@router.get("/me", response_model=list[ReminderInfo],
            dependencies=[Depends(require_role(Role.employee))])
async def my_reminders(
    limit: int = Query(100, ge=1, le=200),
    user: User = Depends(get_current_user),
    service: ReminderServices = Depends(),
):
    """Xodim: o'ziga kelgan eslatmalar."""
    return await service.my_reminders(user_id=user.id, limit=limit)


@router.patch("/{reminder_id}/read", response_model=ReminderInfo,
              dependencies=[Depends(require_role(Role.employee))])
async def mark_read(
    reminder_id: UUID,
    user: User = Depends(get_current_user),
    service: ReminderServices = Depends(),
):
    """Xodim eslatmani o'qilgan deb belgilaydi."""
    return await service.mark_read(user_id=user.id, reminder_id=reminder_id)
