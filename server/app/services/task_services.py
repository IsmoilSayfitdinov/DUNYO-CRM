import logging
from uuid import UUID

from fastapi import Depends, HTTPException, status

from app.core.timezone import now_utc
from app.enum.task_status import TaskStatus
from app.helper.get_current_employee import get_current_employee
from app.helper.verify_leader_owns_employee import verify_leader_owns_employee
from app.model.task import Task
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.leader_repository import LeaderRepository
from app.repositories.tasks_repository import TasksRepository
from app.schemas.task import TaskCreate, TaskInfo, TaskWithEmployee
from app.services.notification_services import NotificationService

logger = logging.getLogger("app.task")

# Holatni UI uchun o'zbekcha (push matnida)
_STATUS_UZ = {
    TaskStatus.todo: "Bajarilmagan",
    TaskStatus.in_progress: "Jarayonda",
    TaskStatus.done: "Bajarildi",
}


def _employee_name(employee) -> str:
    u = getattr(employee, "user", None)
    if not u:
        return "Xodim"
    return (f"{u.first_name or ''} {u.last_name or ''}".strip() or u.username)


class TaskServices:
    def __init__(
        self,
        repo: TasksRepository = Depends(),
        employee_repo: EmployeeRepository = Depends(),
        leader_repo: LeaderRepository = Depends(),
        notif: NotificationService = Depends(),
    ):
        self.repo = repo
        self.employee_repo = employee_repo
        self.leader_repo = leader_repo
        self.notif = notif

    # ---------- RAHBAR ----------

    async def create_task(self, user_id: UUID, data: TaskCreate) -> TaskInfo:
        """Rahbar xodimga vazifa yaratadi (+ xodimga push)."""
        leader = await self.leader_repo.get_by_user_id(user_id)
        if not leader:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Siz rahbar emasiz !")

        # Xodim shu rahbarniki ekanini tekshiramiz (IDOR himoyasi)
        employee = await verify_leader_owns_employee(
            self.leader_repo, self.employee_repo, user_id=user_id, employee_id=data.employee_id
        )

        task = await self.repo.create(Task(
            title=data.title,
            description=data.description,
            employee_id=employee.id,
            created_by=leader.id,
            priority=data.priority,
            due_date=data.due_date,
            status=TaskStatus.todo,
        ))

        # Xodimga bildirishnoma (xato bo'lsa amalni buzmasin)
        try:
            await self.notif.notify(
                employee.user_id,
                title="Yangi vazifa 📋",
                body=f"{data.title} — muddat: {data.due_date:%d.%m.%Y}",
                type="task",
                link="/employee/tasks",
            )
        except Exception:  # noqa: BLE001
            logger.exception("Yangi vazifa notify xatosi")

        return TaskInfo.model_validate(task)

    async def list_team_tasks(self, user_id: UUID) -> list[TaskWithEmployee]:
        """Rahbar: o'zi yaratgan barcha vazifalar (xodim ismi bilan)."""
        leader = await self.leader_repo.get_by_user_id(user_id)
        if not leader:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Siz rahbar emasiz !")
        items = await self.repo.list_for_leader(leader.id)
        return [
            TaskWithEmployee(**TaskInfo.model_validate(t).model_dump(), employee_name=_employee_name(t.employee))
            for t in items
        ]

    async def delete_task(self, user_id: UUID, task_id: UUID) -> None:
        """Rahbar o'zi yaratgan vazifani o'chiradi (IDOR himoyasi)."""
        leader = await self.leader_repo.get_by_user_id(user_id)
        if not leader:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Siz rahbar emasiz !")
        task = await self.repo.get_by_id(task_id)
        if not task or task.created_by != leader.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Vazifa topilmadi !")
        await self.repo.delete(task)

    # ---------- XODIM ----------

    async def my_tasks(self, user_id: UUID) -> list[TaskInfo]:
        """Xodim: o'ziga biriktirilgan vazifalar."""
        employee = await get_current_employee(self.employee_repo, user_id)
        items = await self.repo.list_for_employee(employee.id)
        return [TaskInfo.model_validate(t) for t in items]

    async def update_status(self, user_id: UUID, task_id: UUID, new_status: TaskStatus) -> TaskInfo:
        """Xodim o'z vazifasi holatini o'zgartiradi. done bo'lsa completed_at qo'yiladi."""
        employee = await get_current_employee(self.employee_repo, user_id)
        task = await self.repo.get_by_id(task_id)
        if not task or task.employee_id != employee.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Vazifa topilmadi !")

        task.status = new_status
        task.completed_at = now_utc() if new_status == TaskStatus.done else None
        task = await self.repo.save(task)

        # Rahbarga "xodim holatni o'zgartirdi" bildirishnomasi
        try:
            leader = await self.leader_repo.get_by_id(task.created_by)
            if leader:
                await self.notif.notify(
                    leader.user_id,
                    title="Vazifa holati o'zgardi",
                    body=f"{_employee_name(employee)}: «{task.title}» — {_STATUS_UZ.get(new_status, new_status.value)}",
                    type="task",
                    link="/leader/tasks",
                )
        except Exception:  # noqa: BLE001
            logger.exception("Vazifa holati notify xatosi")

        return TaskInfo.model_validate(task)
