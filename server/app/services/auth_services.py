from datetime import timedelta
from uuid import UUID

from fastapi import Depends, HTTPException, status

from app.core.config import setting
from app.core.security import (
    check_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    dummy_password_check,
    hash_password,
)
from app.core.timezone import ensure_aware, now_utc
from app.model.session import Session
from app.repositories.session_repository import SessionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.login import LoginRequest, LoginResponse
from app.schemas.session import SessionInfo
from app.schemas.token_info import TokenInfo
from app.schemas.user_info import UserInfo


def _device_label(ua: str | None) -> str:
    """User-Agent'dan o'qiladigan qisqa nom (kutubxonasiz oddiy evristika)."""
    if not ua:
        return "Noma'lum qurilma"
    u = ua.lower()
    if "iphone" in u:
        os_name = "iPhone"
    elif "ipad" in u:
        os_name = "iPad"
    elif "android" in u:
        os_name = "Android"
    elif "windows" in u:
        os_name = "Windows"
    elif "mac os" in u or "macintosh" in u:
        os_name = "Mac"
    elif "linux" in u:
        os_name = "Linux"
    else:
        os_name = "Qurilma"
    if "edg" in u:
        browser = "Edge"
    elif "chrome" in u or "crios" in u:
        browser = "Chrome"
    elif "firefox" in u or "fxios" in u:
        browser = "Firefox"
    elif "safari" in u:
        browser = "Safari"
    else:
        browser = "Brauzer"
    return f"{os_name} · {browser}"


class AuthService:
    def __init__(
        self,
        repo: UserRepository = Depends(),
        session_repo: SessionRepository = Depends(),
    ):
        self.repo = repo
        self.session_repo = session_repo

    async def login(self, data: LoginRequest, ip: str | None = None, user_agent: str | None = None) -> LoginResponse:
        user = await self.repo.get_user_by_username(data.username)

        if not user:
            # Timing-attack / user-enumeration himoyasi
            dummy_password_check()
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Foydalanuvchi nomi yoki parol noto'g'ri")

        if not check_password(data.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Foydalanuvchi nomi yoki parol noto'g'ri")

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Hisobingiz faol emas. Administrator bilan bog'laning.")

        # Yangi sessiya — refresh/access tokenlardagi jti shu sessiya id'si bo'ladi.
        now = now_utc()
        session = await self.session_repo.create(Session(
            user_id=user.id,
            user_agent=user_agent,
            ip_address=ip,
            last_used_at=now,
            expires_at=now + timedelta(days=setting.REFRESH_TOKEN_EXPIRE_DAYS),
        ))

        access_token = create_access_token(user.id, user.role.value, jti=session.id)
        refresh_token = create_refresh_token(user.id, jti=session.id)

        return LoginResponse(
            user=UserInfo.model_validate(user),
            token=TokenInfo(access_token=access_token, refresh_token=refresh_token),
        )

    async def refresh(self, refresh_token: str, ip: str | None = None, user_agent: str | None = None) -> TokenInfo:
        payload = decode_token(refresh_token, token_type="refresh")
        user_id = UUID(payload.get("sub"))
        jti = payload.get("jti")

        if not jti:
            # Eski (sessiyasiz) token — qaytadan login qilish kerak
            raise HTTPException(401, "Sessiya yaroqsiz. Iltimos, qaytadan tizimga kiring.")

        session = await self.session_repo.get_by_id(UUID(jti))
        if (
            not session
            or session.revoked
            or session.user_id != user_id
            or ensure_aware(session.expires_at) < now_utc()
        ):
            raise HTTPException(401, "Sessiya yaroqsiz. Iltimos, qaytadan tizimga kiring.")

        user = await self.repo.get_user_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(401, "Sessiya yaroqsiz. Iltimos, qaytadan tizimga kiring.")

        await self.session_repo.touch(session.id, ip, user_agent)

        new_access_token = create_access_token(user.id, user.role.value, jti=session.id)
        new_refresh_token = create_refresh_token(user.id, jti=session.id)

        return TokenInfo(access_token=new_access_token, refresh_token=new_refresh_token)

    # ---------- Parol o'zgartirish ----------

    async def change_password(self, user_id: UUID, current_password: str, new_password: str, current_jti: str | None = None) -> None:
        user = await self.repo.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Foydalanuvchi topilmadi")

        if not check_password(current_password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Joriy parol noto'g'ri")

        user.password_hash = hash_password(new_password)
        await self.repo.database.commit()

        # Xavfsizlik: parol o'zgargach joriy sessiyadan tashqari hammasini chiqaramiz.
        except_id = UUID(current_jti) if current_jti else None
        await self.session_repo.revoke_all_for_user(user_id, except_id=except_id)

    # ---------- Faol seanslar ----------

    async def list_sessions(self, user_id: UUID, current_jti: str | None = None) -> list[SessionInfo]:
        sessions = await self.session_repo.list_active_by_user(user_id)
        return [
            SessionInfo(
                id=s.id,
                device=_device_label(s.user_agent),
                ip_address=s.ip_address,
                last_used_at=s.last_used_at,
                created_at=s.created_at,
                is_current=(current_jti is not None and str(s.id) == str(current_jti)),
            )
            for s in sessions
        ]

    async def revoke_session(self, user_id: UUID, session_id: UUID) -> None:
        session = await self.session_repo.get_by_id(session_id)
        if not session or session.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sessiya topilmadi")
        await self.session_repo.revoke(session_id)
