"""Deploy bo'lganda barcha xodimga 'Yangilanish keldi' push yuborish.

Mantiq: server ishga tushganda (lifespan startup) joriy APP_VERSION ni bazadagi
app_meta['last_pushed_version'] bilan solishtiramiz.
  - Farq bo'lsa -> yangi deploy. Barcha push obunasiga push yuboramiz va versiyani
    yangilaymiz (shu bilan keyingi oddiy restart'larda QAYTA yuborilmaydi).
  - Teng bo'lsa -> oddiy restart. Hech narsa yubormaymiz.

Bu in-app notification (notify) emas — bevosita qurilma push (brauzer yopiq bo'lsa
ham keladi). Per-user sozlama tekshirilmaydi: bu tizim darajasidagi muhim e'lon.
"""

import asyncio
import logging

from sqlalchemy import select

from app.core.config import setting
from app.core.push import push_configured, send_web_push
from app.db.database import create_new_session
from app.model.app_meta import AppMeta
from app.model.push_subscription import PushSubscription

logger = logging.getLogger("app.update_broadcast")

_META_KEY = "last_pushed_version"

# Push ichida foydalanuvchi ko'radigan matn
_PUSH_TITLE = "Yangilanish keldi"
_PUSH_BODY = "Ilovaning yangi versiyasi tayyor. Ochib, eng so'nggi imkoniyatlardan foydalaning."


async def broadcast_update_if_new() -> None:
    """APP_VERSION o'zgargan bo'lsa, barcha obunaga 'Yangilanish keldi' push yuboradi."""
    if not push_configured():
        logger.info("Push sozlanmagan (VAPID yo'q) — update broadcast o'tkazib yuborildi.")
        return

    current = setting.APP_VERSION

    async with create_new_session() as session:
        # 1) Oxirgi yuborilgan versiyani o'qiymiz
        row = await session.scalar(select(AppMeta).where(AppMeta.key == _META_KEY))
        last_version = row.value if row else None

        if last_version == current:
            # Oddiy restart — yangi deploy emas. Hech narsa qilmaymiz.
            logger.info("APP_VERSION o'zgarmagan (%s) — update push yuborilmadi.", current)
            return

        # 2) Yangi deploy — barcha push obunasini olamiz
        subs = list(await session.scalars(select(PushSubscription)))
        logger.info(
            "Yangi versiya %s (oldingi: %s) — %d ta obunaga update push yuborilmoqda.",
            current, last_version, len(subs),
        )

        payload = {"title": _PUSH_TITLE, "body": _PUSH_BODY, "url": "/"}
        expired_endpoints: list[str] = []
        sent_count = 0

        for s in subs:
            info = {"endpoint": s.endpoint, "keys": {"p256dh": s.p256dh, "auth": s.auth}}
            # pywebpush sinxron — event loop'ni bloklamaslik uchun thread'da
            sent, expired = await asyncio.to_thread(send_web_push, info, payload)
            if sent:
                sent_count += 1
            if expired:
                expired_endpoints.append(s.endpoint)

        # 3) Eskirgan (404/410) obunalarni tozalaymiz
        for ep in expired_endpoints:
            stale = await session.scalar(
                select(PushSubscription).where(PushSubscription.endpoint == ep)
            )
            if stale:
                await session.delete(stale)

        # 4) Versiyani yangilaymiz — endi shu versiya uchun qayta yuborilmaydi
        if row:
            row.value = current
        else:
            session.add(AppMeta(key=_META_KEY, value=current))

        await session.commit()
        logger.info(
            "Update push yakunlandi: %d yuborildi, %d eskirgan obuna o'chirildi.",
            sent_count, len(expired_endpoints),
        )
