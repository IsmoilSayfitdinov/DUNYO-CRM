from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user, require_role
from app.enum.role import Role
from app.model.user import User
from app.schemas.branch import BranchCreate, BranchInfo, BranchUpdate
from app.services.branch_services import BranchService

router = APIRouter(prefix="/branches", tags=["Branches"])


@router.post(
    "/",
    response_model=BranchInfo,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(Role.leader))],
)
async def create_branch(
    data: BranchCreate,
    user: User = Depends(get_current_user),
    branchService: BranchService = Depends(),
):
    return await branchService.create(user_id=user.id, data=data)

@router.put(
    "/{branch_id}",
    response_model=BranchInfo,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_role(Role.leader))],
)
async def update_branch(
    branch_id: UUID,
    data: BranchUpdate,
    user: User = Depends(get_current_user),
    branchService: BranchService = Depends(),
):
    return await branchService.update(user_id=user.id, branch_id=branch_id, data=data)



@router.delete(
    "/{branch_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(Role.leader))],
)
async def delete_branch(
    branch_id: UUID,
    user: User = Depends(get_current_user),
    branchService: BranchService = Depends(),
):
    await branchService.delete(branch_id=branch_id, user_id=user.id)


@router.get("/", response_model=list[BranchInfo], dependencies=[Depends(require_role(Role.leader))])
async def my_branches(
    user: User = Depends(get_current_user),
    branchService: BranchService = Depends(),
):
    return await branchService.get_my_branches(user_id=user.id)
