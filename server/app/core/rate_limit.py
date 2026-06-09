"""Oddiy in-memory rate-limiter (login brute-force'ga qarshi).

DIQQAT: bu jarayon-ichidagi (process-local) hisoblagich. Bir nechta worker/instance
bo'lsa, har birida alohida bo'ladi — to'liq himoya uchun Redis-asosli limiter tavsiya
etiladi (redis allaqachon requirements'da). Hozircha bitta instance uchun yetarli.
"""

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status


class SlidingWindowRateLimiter:
    def __init__(self, max_attempts: int, window_seconds: int):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str) -> None:
        now = time.monotonic()
        window_start = now - self.window_seconds
        hits = self._hits[key]

        # Eski urinishlarni tozalash
        while hits and hits[0] < window_start:
            hits.popleft()

        if len(hits) >= self.max_attempts:
            retry_after = int(hits[0] + self.window_seconds - now) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring.",
                headers={"Retry-After": str(max(retry_after, 1))},
            )

        hits.append(now)


# 5 daqiqada 10 urinishdan ko'p bo'lmasin
login_rate_limiter = SlidingWindowRateLimiter(max_attempts=10, window_seconds=300)


def client_ip(request: Request) -> str:
    # Reverse-proxy orqasida bo'lsa X-Forwarded-For ning birinchi qiymati
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
