import secrets
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader, HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import setting
from app.core.security import decode_token
from app.core.timezone import ensure_aware, now_utc
from app.enum.role import Role
from app.model.user import User
from app.repositories.session_repository import SessionRepository
from app.repositories.user_repository import UserRepository

security = HTTPBearer()

# NFC reader qurilmasi maxfiy kalitni shu header orqali yuboradi.
# auto_error=False — kalit bo'lmasa ham FastAPI o'zi 403 bermaydi; biz aniq
# xato xabarini o'zimiz beramiz.
nfc_api_key_header = APIKeyHeader(name="X-NFC-Device-Key", auto_error=False)


def verify_nfc_device(api_key: str | None = Depends(nfc_api_key_header)) -> None:
    """NFC reader qurilmasini maxfiy kalit orqali tekshiradi.

    Bu endpoint foydalanuvchi tokeni bilan emas, qurilma tomonidan chaqiriladi.
    - Kalit serverda sozlanmagan bo'lsa (None) -> 503: endpoint o'chiq, hech kim
      autentifikatsiyasiz davomat soxtalashtira olmaydi.
    - Kalit noto'g'ri/yo'q bo'lsa -> 401.
    secrets.compare_digest — constant-time solishtiruv (timing attack himoyasi)."""
    expected = setting.NFC_DEVICE_API_KEY
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="NFC xizmati sozlanmagan !",
        )
    if not api_key or not secrets.compare_digest(api_key, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="NFC qurilma kaliti noto'g'ri !",
        )


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
        # DIQQAT: avval rahbarni shartsiz o'tkazib yuborardik (blanket bypass).
        # Bu require_role(Role.employee) kabi cheklovlarni rahbar uchun ishlamay
        # qoldirardi — kelajakda xodim-only endpoint qo'shilsa, rahbar jimgina
        # kirib ketardi. Endi faqat ruxsat etilgan rollar tekshiriladi.
        if user.role not in allowed_roles:
            raise HTTPException(
                403,
                "Bu amalni bajarish uchun ruxsat yoq"
            )
        return user
    return role_checker