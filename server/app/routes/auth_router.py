from uuid import UUID

from fastapi import APIRouter, Depends, Request, status

from app.core.dependencies import get_access_payload, get_current_user
from app.core.rate_limit import client_ip, login_rate_limiter
from app.model.user import User
from app.schemas.login import LoginRequest, LoginResponse
from app.schemas.password import ChangePasswordRequest
from app.schemas.refresh import RefreshRequest
from app.schemas.session import SessionInfo
from app.schemas.token_info import TokenInfo
from app.schemas.user_info import UserInfo
from app.services.auth_services import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    request: Request,
    data: LoginRequest,
    auth_service: AuthService = Depends(),
) -> LoginResponse:
    # Brute-force'ga qarshi: IP + username bo'yicha urinishlarni cheklash
    login_rate_limiter.check(f"{client_ip(request)}:{data.username.lower()}")
    return await auth_service.login(
        data,
        ip=client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )


@router.post("/refresh", response_model=TokenInfo)
async def refresh_token(
    request: Request,
    data: RefreshRequest,
    auth_service: AuthService = Depends(),
) -> TokenInfo:
    login_rate_limiter.check(f"refresh:{client_ip(request)}")
    return await auth_service.refresh(
        data.refresh_token,
        ip=client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )


@router.get("/me", response_model=UserInfo)
async def my_profile(user: User = Depends(get_current_user)):
    return UserInfo.model_validate(user)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    data: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    payload: dict = Depends(get_access_payload),
    auth_service: AuthService = Depends(),
):
    await auth_service.change_password(
        user_id=user.id,
        current_password=data.current_password,
        new_password=data.new_password,
        current_jti=payload.get("jti"),
    )


@router.get("/sessions", response_model=list[SessionInfo])
async def list_sessions(
    user: User = Depends(get_current_user),
    payload: dict = Depends(get_access_payload),
    auth_service: AuthService = Depends(),
):
    return await auth_service.list_sessions(user.id, current_jti=payload.get("jti"))


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_session(
    session_id: UUID,
    user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(),
):
    await auth_service.revoke_session(user.id, session_id)
