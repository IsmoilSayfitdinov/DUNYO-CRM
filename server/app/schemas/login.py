from pydantic import BaseModel, Field
from app.schemas.token_info import TokenInfo
from app.schemas.user_info import UserInfo

class LoginRequest(BaseModel):
    # LOGIN'da parol uzunligini cheklamaymiz — noto'g'ri urinish 401 qaytarsin
    # (422 emas). Uzunlik siyosati faqat parol YARATISH/o'zgartirishda qo'llanadi.
    # Bu, eski qisqa parolli foydalanuvchilarni ham bloklamaslik uchun.
    username: str = Field(..., min_length=1, max_length=150)
    password: str = Field(..., min_length=1, max_length=200)

class LoginResponse(BaseModel):
    user: UserInfo
    token: TokenInfo
    
