"""Markazlashgan vaqt-zonasi yordamchilari.

Barcha timestamp'lar DB'da UTC (timezone-aware) saqlanadi, lekin biznes-mantiq
(ish kuni chegarasi, kechikishni aniqlash) MAHALLIY vaqt zonasida hisoblanishi kerak.
Avval UTC'dagi `now` ni mahalliy vaqtga o'tkazib, keyin solishtiramiz.
"""

from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo

# Biznes vaqt zonasi (O'zbekiston). Kelajakda filialga qarab o'zgartirish mumkin.
BUSINESS_TZ = ZoneInfo("Asia/Tashkent")
UTC = timezone.utc


def now_utc() -> datetime:
    """Saqlash uchun: timezone-aware UTC hozirgi vaqt."""
    return datetime.now(UTC)


def now_local() -> datetime:
    """Biznes vaqt zonasidagi hozirgi vaqt (kechikish/sana hisob-kitobi uchun)."""
    return datetime.now(BUSINESS_TZ)


def today_local() -> date:
    """Biznes vaqt zonasidagi joriy sana (ish kuni chegarasi)."""
    return now_local().date()


def ensure_aware(dt: datetime) -> datetime:
    """Naive datetime'ni UTC deb belgilaydi (aware qiladi). Naive vs aware
    solishtirishdagi TypeError'ning oldini oladi (ba'zi DB'lar naive qaytaradi)."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt


def to_local(dt: datetime) -> datetime:
    """Istalgan datetime'ni biznes vaqt zonasiga o'tkazadi.

    Naive datetime UTC deb qabul qilinadi (DB ustunlari timezone-aware bo'lsa-da,
    ba'zi yo'llarda naive qiymat kelishi mumkin).
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt.astimezone(BUSINESS_TZ)


def to_utc_from_local(dt: datetime) -> datetime:
    """Tashqaridan (rahbar formasidan) kelgan vaqtni UTC'ga normallashtiradi.

    Rahbar Toshkentda o'tirib "16:00" kiritsa, bu NAIVE (timezone'siz) keladi.
    Uni "Toshkent vaqti" deb belgilab, so'ng UTC'ga o'tkazamiz — DB doim UTC saqlaydi.
    Bu naive vs aware solishtirishdagi 500 xatosini va 5 soatlik siljishni oldini oladi.
    """
    if dt.tzinfo is None:
        # 1) Naive vaqtga "bu Toshkent vaqti" deb tzinfo yopishtiramiz (raqam o'zgarmaydi).
        dt = dt.replace(tzinfo=BUSINESS_TZ)
    # 2) Endi UTC'ga aylantiramiz (16:00 Toshkent -> 11:00 UTC). Agar allaqachon
    #    aware (masalan ...Z) bo'lsa, astimezone uni to'g'ri UTC'ga keltiradi.
    return dt.astimezone(UTC)
