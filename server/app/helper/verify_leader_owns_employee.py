from uuid import UUID

from fastapi import HTTPException

from app.model.employee import Employee
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.leader_repository import LeaderRepository


async def verify_leader_owns_employee(
    leader_repo: LeaderRepository,
    employee_repo: EmployeeRepository,
    user_id: UUID,
    employee_id: UUID,
) -> Employee:
        leader = await leader_repo.get_by_user_id(user_id)
        
        if not leader:
            raise HTTPException(403, "Siz rahbar emasiz !")
        employee = await employee_repo.get_by_id(employee_id)
        if not employee:
            raise HTTPException(404, "Xodim topilmadi !")
        if employee.leader_id != leader.id:
            raise HTTPException(403, "Bu xodim sizga tegishli emas !")
        return employee