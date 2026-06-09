import logging
from uuid import UUID

from fastapi import Depends, HTTPException, status

from app.helper.get_current_employee import get_current_employee
from app.helper.verify_leader_owns_employee import verify_leader_owns_employee
from app.model.reminder import Reminder
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.leader_repository import LeaderRepository
from app.repositories.reminder_repository import ReminderRepository
from app.schemas.reminder import ReminderCreate, ReminderInfo, ReminderWithEmployee
from app.services.notification_services import NotificationService

logger = logging.getLogger("app.reminder")


def _employee_name(employee) -> str:
    u = getattr(employee, "user", None)
    if not u:
        return "Xodim"
    return (f"{u.first_name or ''} {u.last_name or ''}".strip() or u.username)


class ReminderServices:
    def __init__(
        self,
        repo: ReminderRepository = Depends(),
        employee_repo: EmployeeRepository = Depends(),
        leader_repo: LeaderRepository = Depends(),
        notif: NotificationService = Depends(),
    ):
        self.repo = repo
        self.employee_repo = employee_repo
        self.leader_repo = leader_repo
        self.notif = notif

    # ---------- RAHBAR ----------

    async def create_reminder(self, user_id: UUID, data: ReminderCreate) -> ReminderInfo:
        """Rahbar xodimga eslatma/ogohlantirish yuboradi (+ xodimga push)."""
        leader = await self.leader_repo.get_by_user_id(user_id)
        if not leader:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Siz rahbar emasiz !")

        employee = await verify_leader_owns_employee(
            self.leader_repo, self.employee_repo, user_id=user_id, employee_id=data.employee_id
        )

        reminder = await self.repo.create(Reminder(
            created_by=leader.id,
            employee_id=employee.id,
            title=data.title,
            message=data.message,
            severity=data.severity,
        ))

        # Xodimga bildirishnoma (ogohlantirish bo'lsa ⚠️, oddiy eslatma bo'lsa 🔔)
        try:
            icon = "⚠️" if data.severity == "warning" else "🔔"
            await self.notif.notify(
                employee.user_id,
                title=f"{icon} {data.title}",
                body=data.message or ("Rahbardan ogohlantirish" if data.severity == "warning" else "Rahbardan eslatma"),
                type="task",
                link="/employee/notifications",
            )
        except Exception:  # noqa: BLE001
            logger.exception("Eslatma notify xatosi")

        return ReminderInfo.model_validate(reminder)

    async def list_team_reminders(self, user_id: UUID) -> list[ReminderWithEmployee]:
        """Rahbar: o'zi yuborgan barcha eslatmalar (xodim ismi bilan)."""
        leader = await self.leader_repo.get_by_user_id(user_id)
        if not leader:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Siz rahbar emasiz !")
        items = await self.repo.list_for_leader(leader.id)
        return [
            ReminderWithEmployee(**ReminderInfo.model_validate(r).model_dump(), employee_name=_employee_name(r.employee))
            for r in items
        ]

    async def delete_reminder(self, user_id: UUID, reminder_id: UUID) -> None:
        """Rahbar o'zi yuborgan eslatmani o'chiradi (IDOR himoyasi)."""
        leader = await self.leader_repo.get_by_user_id(user_id)
        if not leader:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Siz rahbar emasiz !")
        reminder = await self.repo.get_by_id(reminder_id)
        if not reminder or reminder.created_by != leader.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Eslatma topilmadi !")
        await self.repo.delete(reminder)

    # ---------- XODIM ----------

    async def my_reminders(self, user_id: UUID, limit: int = 100) -> list[ReminderInfo]:
        """Xodim: o'ziga kelgan eslatmalar."""
        employee = await get_current_employee(self.employee_repo, user_id)
        items = await self.repo.list_for_employee(employee.id, limit)
        return [ReminderInfo.model_validate(r) for r in items]

    async def mark_read(self, user_id: UUID, reminder_id: UUID) -> ReminderInfo:
        """Xodim eslatmani o'qilgan deb belgilaydi."""
        employee = await get_current_employee(self.employee_repo, user_id)
        reminder = await self.repo.get_by_id(reminder_id)
        if not reminder or reminder.employee_id != employee.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Eslatma topilmadi !")
        if not reminder.is_read:
            reminder.is_read = True
            reminder = await self.repo.save(reminder)
        return ReminderInfo.model_validate(reminder)
