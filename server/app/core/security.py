from datetime import datetime, timedelta, timezone
import bcrypt
import jwt  # PyJWT kutubxonasi
from fastapi import HTTPException, status
from app.core.config import setting


# ==================== PASSWORD HASHING (Xavfsiz native bcrypt) ====================

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def check_password(password: str, hashed: str) -> bool:
    pwd_bytes = password.encode('utf-8')
    hashed_bytes = hashed.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)


# Foydalanuvchi topilmaganda ham bir xil vaqt ketishi uchun (timing-attack /
# user-enumeration'ning oldini olish) shu yolg'on hashga tekshiruv qilamiz.
_DUMMY_PASSWORD_HASH = hash_password("dummy-password-for-timing-equalization")


def dummy_password_check() -> None:
    """User topilmaganda chaqiriladi — javob vaqtini tenglashtiradi."""
    bcrypt.checkpw(b"invalid", _DUMMY_PASSWORD_HASH.encode("utf-8"))


# ==================== JWT TOKENS (Yaxshilangan va alohida kalitli) ====================

def create_access_token(user_id, role, jti: str | None = None) -> str:
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=setting.ACCESS_TOKEN_EXPIRE_MINUTES),
        "type": "access",
    }
    if jti is not None:
        payload["jti"] = str(jti)   # sessiya id'si (faol seanslar / revoke uchun)
    return jwt.encode(payload, setting.JWT_ACCESS_SECRET, algorithm=setting.JWT_ALGORITHM)


def create_refresh_token(user_id: str, jti: str | None = None) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(days=setting.REFRESH_TOKEN_EXPIRE_DAYS),
        "type": "refresh",
    }
    if jti is not None:
        payload["jti"] = str(jti)   # sessiya id'si
    return jwt.encode(payload, setting.JWT_REFRESH_SECRET, algorithm=setting.JWT_ALGORITHM)


def decode_token(token: str, token_type: str = "access") -> dict:
   try:
      secret = setting.JWT_ACCESS_SECRET if token_type == "access" else setting.JWT_REFRESH_SECRET
      
      payload = jwt.decode(token, secret, algorithms=[setting.JWT_ALGORITHM])
      
      if payload.get("type") != token_type:
          raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token turi noto'g'ri")
          
      return payload
      
   except jwt.ExpiredSignatureError:
       raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token muddati o'tgan")
   except jwt.PyJWTError:
       raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Noto'g'ri token")
   