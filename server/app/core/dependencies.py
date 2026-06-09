from uuid import UUID

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_token
from app.core.timezone import ensure_aware, now_utc
from app.enum.role import Role
from app.model.user import User
from app.repositories.session_repository import SessionRepository
from app.repositories.user_repository import UserRepository

security = HTTPBearer()


def get_access_payload(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Access tokenni dekod qilib payload qaytaradi (jti'ni olish uchun)."""
    return decode_token(credentials.credentials, token_type="access")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    repo: UserRepository = Depends(),
    session_repo: SessionRepository = Depends(),
) -> User:
    token = credentials.credentials
    payload = decode_token(token, token_type="access")

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(401, "Token notogri !")

    user = await repo.get_user_by_id(UUID(user_id_str))
    if not user:
        raise HTTPException(401, "User topilmadi !")

    # XAVFSIZLIK: deaktiv qilingan / o'chirilgan foydalanuvchi (masalan ishdan
    # bo'shatilgan xodim) hali amal qiluvchi token bilan kira olmasligi kerak.
    if not user.is_active:
        raise HTTPException(401, "Hisob faol emas")

    # Sessiya tekshiruvi: tokenda jti bo'lsa, sessiya bekor qilingan/tugagan bo'lsa
    # rad etamiz — shu sababli "seansni chiqarish" darhol kuchga kiradi.
    jti = payload.get("jti")
    if jti:
        session = await session_repo.get_by_id(UUID(jti))
        if (
            not session
            or session.revoked
            or session.user_id != user.id
            or ensure_aware(session.expires_at) < now_utc()
        ):
            raise HTTPException(401, "Sessiya tugatilgan. Iltimos, qaytadan tizimga kiring.")

    return user

def require_role(*allowed_roles: Role):
    async def role_checker(user: User = Depends(get_current_user)) -> User:
        # Superuser — to'liq admin: barcha rol tekshiruvlaridan o'tadi.
        if user.role == Role.superuser:
            return user
        if user.role not in allowed_roles:
            raise HTTPException(
                403,
                "Bu amalni bajarish uchun ruxsat yoq"
            )
        return user
    return role_checker