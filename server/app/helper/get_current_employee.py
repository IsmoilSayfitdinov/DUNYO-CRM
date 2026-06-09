from uuid import UUID

from fastapi import HTTPException, status

from app.model.employee import Employee
from app.repositories.employee_repository import EmployeeRepository


async def get_current_employee(employee_repo: EmployeeRepository, user_id: UUID) -> Employee:
    employee = await employee_repo.get_by_user_id(user_id=user_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Siz xodim emasiz !",
        )
    return employee
