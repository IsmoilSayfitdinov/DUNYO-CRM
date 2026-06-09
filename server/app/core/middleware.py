from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import setting


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Asosiy xavfsizlik javob-header'lari (clickjacking, MIME-sniffing, HSTS)."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        # HSTS faqat production'da (HTTPS orqasida) ma'noga ega
        if not setting.debug:
            response.headers.setdefault(
                "Strict-Transport-Security",
                "max-age=31536000; includeSubDomains",
            )
        return response


def setup_middleware(app: FastAPI) -> None:
    # Production'da faqat config'dagi haqiqiy domenlar.
    cors_origins = list(setting.CORS_ORIGINS)
    allowed_hosts = list(setting.ALLOWED_HOSTS)
    # Dev rejimida (debug) localhost VA istalgan lokal-tarmoq IP'siga ruxsat —
    # telefon/boshqa qurilmalardan test qilish uchun (IP DHCP bilan o'zgarishi mumkin).
    cors_kwargs = dict(
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )
    if setting.debug:
        # localhost, 127.x, 10.x, 192.168.x, 172.16-31.x — istalgan portda
        cors_kwargs["allow_origin_regex"] = (
            r"^https?://("
            r"localhost|127\.0\.0\.1|"
            r"10\.\d{1,3}\.\d{1,3}\.\d{1,3}|"
            r"192\.168\.\d{1,3}\.\d{1,3}|"
            r"172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}"
            r")(:\d+)?$"
        )
        allowed_hosts = ["*"]  # dev: Host header tekshiruvini bo'shashtiramiz

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        **cors_kwargs,
    )

    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=allowed_hosts,
    )

    app.add_middleware(SecurityHeadersMiddleware)

    app.add_middleware(
        GZipMiddleware,
        minimum_size=1000
    )
