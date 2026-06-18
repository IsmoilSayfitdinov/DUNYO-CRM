from pydantic_settings import BaseSettings, SettingsConfigDict

class Setting(BaseSettings):
    app_name: str = "Hodim boshqaruv API"
    # XAVFSIZLIK: debug ishlab chiqarishda (production) o'chiq bo'lishi SHART —
    # aks holda stack-trace va DB connection string mijozga sizib chiqadi.
    # Faqat .env da DEBUG=true qo'yilganda yoqiladi.
    debug: bool = False

    DATABASE_URL: str

    # Ishlab chiqarishda faqat haqiqiy domenlar. Dev origin'lar (localhost) uchun
    # .env da CORS_ORIGINS ni override qiling (masalan JSON ro'yxat sifatida).
    CORS_ORIGINS: list[str] = [
        "https://hr.supermarketdunyo.uz",
        "https://api.supermarketdunyo.uz",
        "https://dunyo-crm-client-production.up.railway.app",
        "https://dunyo-crm-server-production.up.railway.app",
    ]
    # Host header himoyasi (TrustedHost)
    ALLOWED_HOSTS: list[str] = [
        "api.supermarketdunyo.uz",
        "dunyo-crm-server-production.up.railway.app",
    ]

    static_dir: str = 'static'
    image_dir: str = "static/images"

    docs_url: str = '/api/docs'
    redoc_url: str ='/api/redoc'
    
    JWT_ACCESS_SECRET: str
    JWT_REFRESH_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # NFC reader (turniket/eshik) qurilmasi uchun maxfiy kalit. /attendance/nfc
    # foydalanuvchi tokeni bilan emas, balki qurilma tomonidan chaqiriladi —
    # shuning uchun u shu kalit bilan himoyalanadi. Kalit o'rnatilmasa (None),
    # endpoint butunlay o'chiriladi (503), aks holda har kim davomatni soxtalashtirardi.
    NFC_DEVICE_API_KEY: str | None = None

    # Rate-limiter uchun: ilova oldida nechta ISHONCHLI reverse-proxy bor.
    # 0  -> X-Forwarded-For e'tiborsiz qoldiriladi, faqat haqiqiy TCP IP ishlatiladi
    #       (klient X-Forwarded-For'ni soxtalashtirib brute-force limitini ayllanib o'ta olmaydi).
    # 1+ -> X-Forwarded-For zanjiridan o'ngdan shuncha-inchi IP olinadi (proxy qo'shgan,
    #       klient nazorat qila olmaydigan qiymat). Railway/nginx odatda 1.
    TRUSTED_PROXY_COUNT: int = 0
    
    
    SUPERUSER_USERNAME: str
    SUPERUSER_PASSWORD: str
    SUPERUSER_FIRSTNAME: str
    SUPERUSER_LASTNAME: str
    SUPERUSER_PHONE: str

    # Web Push (VAPID) — bildirishnomalarni qurilmaga yuborish
    VAPID_PUBLIC_KEY: str | None = None
    VAPID_PRIVATE_KEY: str | None = None     # PEM (\n bilan bitta qatorda bo'lishi mumkin)
    VAPID_SUBJECT: str = "mailto:admin@dunyosupermarket.uz"

    # YesPOS integratsiya — barcode bo'yicha mahsulot qidirish (backend proxy)
    YESPOS_URL: str | None = None            # itemsAgr bazaviy URL (key= barcode bilan almashtiriladi)
    YES_POS_SINGIN_API: str | None = None    # signIn endpoint
    YES_POS_USER_LOGIN: str | None = None
    YES_POS_USER_PASSWORD: str | None = None
    YES_POS_USER_ID: str | None = None       # org_id

    # extra="ignore" — .env da modelda yo'q qo'shimcha kalitlar (masalan YES_POS_*)
    # bo'lsa ham ilova ishga tushishi buzilmaydi.
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
    
setting = Setting()