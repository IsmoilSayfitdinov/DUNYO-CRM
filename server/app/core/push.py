"""Web Push (VAPID) yuborish — pywebpush orqali.

Bildirishnoma yaratilganda foydalanuvchining barcha obunalariga push yuboriladi.
Endpoint eskirgan bo'lsa (404/410) — chaqiruvchi uni o'chiradi.
"""

import json
import logging
from functools import lru_cache

from cryptography.hazmat.primitives.serialization import load_pem_private_key
from py_vapid.utils import b64urlencode
from pywebpush import WebPushException, webpush

from app.core.config import setting

logger = logging.getLogger("app.push")


def push_configured() -> bool:
    return bool(setting.VAPID_PRIVATE_KEY and setting.VAPID_PUBLIC_KEY)


@lru_cache(maxsize=1)
def _private_key() -> str:
    raw = (setting.VAPID_PRIVATE_KEY or "").strip()
    if "-----BEGIN" in raw or "\\n" in raw or "\n" in raw:
        pem = raw.replace("\\n", "\n")
        key = load_pem_private_key(pem.encode(), password=None)
        return b64urlencode(key.private_numbers().private_value.to_bytes(32, "big"))
    return raw  # allaqachon raw base64url


def send_web_push(subscription_info: dict, payload: dict) -> tuple[bool, bool]:
    """Bitta obunaga push yuboradi.

    Qaytaradi: (yuborildi, expired) — expired=True bo'lsa obunani o'chirish kerak.
    """
    if not push_configured():
        return (False, False)
    try:
        webpush(
            subscription_info=subscription_info,
            data=json.dumps(payload),
            vapid_private_key=_private_key(),
            vapid_claims={"sub": setting.VAPID_SUBJECT},
            timeout=10,
        )
        return (True, False)
    except WebPushException as e:
        status_code = getattr(getattr(e, "response", None), "status_code", None)
        if status_code in (404, 410):
            return (False, True)   # obuna eskirgan — o'chiriladi
        logger.warning("Web push xatosi (%s): %s", status_code, e)
        return (False, False)
    except Exception as e:  # noqa: BLE001
        logger.warning("Web push kutilmagan xatosi: %s", e)
        return (False, False)
