import logging
from uuid import UUID

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.core.security import decode_token
from app.core.timezone import ensure_aware, now_utc
from app.core.ws_manager import manager
from app.db.database import create_new_session
from app.model.session import Session
from app.model.user import User

logger = logging.getLogger("app.ws")
router = APIRouter()


async def _authenticate(token: str) -> str | None:
    """Access tokenni tekshiradi (user faol + sessiya yaroqli). user_id qaytaradi yoki None."""
    try:
        payload = decode_token(token, token_type="access")
    except Exception:  # noqa: BLE001
        return None
    user_id_str = payload.get("sub")
    if not user_id_str:
        return None

    # Qisqa muddatli sessiya (ulanish davomida DB ushlab turilmasin)
    async with create_new_session() as db:
        user = await db.scalar(select(User).where(User.id == UUID(user_id_str)))
        if not user or not user.is_active:
            return None
        jti = payload.get("jti")
        if jti:
            sess = await db.scalar(select(Session).where(Session.id == UUID(jti)))
            if (not sess or sess.revoked or sess.user_id != user.id
                    or ensure_aware(sess.expires_at) < now_utc()):
                return None
    return user_id_str


@router.websocket("/ws/notifications")
async def ws_notifications(websocket: WebSocket, token: str = Query(...)):
    user_id = await _authenticate(token)
    if not user_id:
        await websocket.close(code=4401)  # Unauthorized
        return

    await manager.connect(user_id, websocket)
    try:
        # ulanishni ochiq ushlab turamiz; kelgan xabarlarni e'tiborsiz qoldiramiz (keepalive)
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
    except Exception:  # noqa: BLE001
        manager.disconnect(user_id, websocket)
