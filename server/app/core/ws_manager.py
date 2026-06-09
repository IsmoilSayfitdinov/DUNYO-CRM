"""Real-time bildirishnoma uchun WebSocket ulanish menejeri.

Jarayon-ichidagi (in-memory) ulanishlar: {user_id: {WebSocket, ...}}.
DIQQAT: bir nechta worker/instance bo'lsa, har birida alohida bo'ladi —
ko'p-instance uchun Redis pub/sub kerak bo'ladi. Bitta instance uchun yetarli.
"""

import logging

from starlette.websockets import WebSocket

logger = logging.getLogger("app.ws")


class ConnectionManager:
    def __init__(self) -> None:
        self.active: dict[str, set[WebSocket]] = {}

    async def connect(self, user_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self.active.setdefault(user_id, set()).add(ws)

    def disconnect(self, user_id: str, ws: WebSocket) -> None:
        conns = self.active.get(user_id)
        if conns:
            conns.discard(ws)
            if not conns:
                self.active.pop(user_id, None)

    async def send_to_user(self, user_id: str, message: dict) -> None:
        conns = self.active.get(user_id)
        if not conns:
            return
        dead: list[WebSocket] = []
        for ws in list(conns):
            try:
                await ws.send_json(message)
            except Exception:  # noqa: BLE001
                dead.append(ws)
        for ws in dead:
            self.disconnect(user_id, ws)


# Yagona global menejer
manager = ConnectionManager()
