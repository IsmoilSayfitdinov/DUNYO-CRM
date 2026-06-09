"""Davomat avto-to'ldirish fon-vazifasi.

FastAPI ishga tushganda fon-loop har yarim tunda KECHAGI kunni to'ldiradi
(kelmaganlarni absent/leave qiladi). Server o'chiq bo'lib kun o'tkazib yuborilsa,
oylik/davomat o'qilganda lazy catch-up (alohida) yetishmagan kunlarni to'ldiradi.

Alohida scheduler kutubxonasi ishlatilmaydi — toza asyncio loop.
"""

import asyncio
import logging
from datetime import datetime, time, timedelta

from app.core.timezone import BUSINESS_TZ, now_local
from app.db.database import create_new_session
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.leave_request_repository import LeaveRequestRepository
from app.services.attendance_backfill_services import AttendanceBackfillService

logger = logging.getLogger("app.attendance.scheduler")

# Yarim tundan keyin shu daqiqada ishlaymiz (kun to'liq tugagani kafolati uchun ozgina kechikish)
RUN_AT = time(hour=0, minute=10)


def _seconds_until_next_run() -> float:
    """Keyingi 00:10 (mahalliy) gacha soniyalar."""
    now = now_local()
    target = datetime.combine(now.date(), RUN_AT, tzinfo=BUSINESS_TZ)
    if now >= target:
        target = target + timedelta(days=1)
    return (target - now).total_seconds()


async def _run_once() -> None:
    """Bitta sessiya ochib, kechagi kunni to'ldiradi (xato bu loop'ni o'ldirmasin)."""
    try:
        async with create_new_session() as session:
            service = AttendanceBackfillService(
                attendance_repo=AttendanceRepository(session),
                employee_repo=EmployeeRepository(session),
                leave_repo=LeaveRequestRepository(session),
            )
            result = await service.backfill_yesterday()
        logger.info("Kunlik davomat backfill bajarildi: %s", result)
    except Exception:  # noqa: BLE001
        logger.exception("Kunlik davomat backfill xatosi")


async def attendance_daily_loop() -> None:
    """Cheksiz loop: keyingi 00:10 gacha kutadi, so'ng kechagi kunni to'ldiradi."""
    logger.info("Davomat avto-to'ldirish loop ishga tushdi")
    while True:
        try:
            await asyncio.sleep(_seconds_until_next_run())
            await _run_once()
        except asyncio.CancelledError:
            logger.info("Davomat loop to'xtatildi")
            raise
        except Exception:  # noqa: BLE001
            logger.exception("Davomat loop kutilmagan xatosi — 1 soatdan keyin qayta urinadi")
            await asyncio.sleep(3600)
