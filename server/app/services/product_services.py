"""YesPOS integratsiyasi — backend proxy.

Brauzerdan to'g'ridan-to'g'ri YesPOS'ga so'rov yuborish CORS bilan bloklanishi va
login/parolni frontend'ga oshkor qilishi mumkin. Shuning uchun server YesPOS'ga
kiradi (signIn), tokenni xotirada keshlaydi va barcode bo'yicha mahsulot qidiradi.
"""

import logging
from urllib.parse import urlencode, urlparse, urlunparse, parse_qs

import httpx
from fastapi import HTTPException, status

from app.core.config import setting
from app.schemas.product import ProductInfo

logger = logging.getLogger("app.yespos")

# Jarayon-ichidagi oddiy token kesh (bitta instance uchun yetarli).
_token_cache: dict[str, str | None] = {"access": None, "refresh": None}


def _extract_token(payload: dict) -> tuple[str | None, str | None]:
    """signIn javobidan token/refresh'ni turli mumkin bo'lgan shakllarda topadi."""
    data = payload.get("data") if isinstance(payload.get("data"), dict) else {}
    access = (
        payload.get("token") or payload.get("access_token") or payload.get("accessToken")
        or data.get("token") or data.get("access_token") or data.get("accessToken")
    )
    refresh = (
        payload.get("refresh_token") or payload.get("refreshToken")
        or data.get("refresh_token") or data.get("refreshToken")
    )
    return access, refresh


class YesPosService:
    def _require_config(self) -> None:
        if not (setting.YES_POS_SINGIN_API and setting.YESPOS_URL
                and setting.YES_POS_USER_LOGIN and setting.YES_POS_USER_PASSWORD
                and setting.YES_POS_USER_ID):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="YesPOS integratsiyasi sozlanmagan.",
            )

    async def _signin(self, client: httpx.AsyncClient) -> str:
        body = {
            "login": setting.YES_POS_USER_LOGIN,
            "org_id": setting.YES_POS_USER_ID,
            "password": setting.YES_POS_USER_PASSWORD,
        }
        try:
            resp = await client.post(setting.YES_POS_SINGIN_API, json=body, timeout=15)
        except httpx.HTTPError as e:
            logger.error("YesPOS signIn ulanish xatosi: %s", e)
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="YesPOS bilan bog'lanib bo'lmadi")

        if resp.status_code >= 400:
            logger.error("YesPOS signIn xato %s: %s", resp.status_code, resp.text[:300])
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="YesPOS autentifikatsiyasi muvaffaqiyatsiz")

        access, refresh = _extract_token(resp.json())
        if not access:
            logger.error("YesPOS signIn javobida token topilmadi. Kalitlar: %s", list(resp.json().keys()))
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="YesPOS token qaytarmadi")

        _token_cache["access"] = access
        _token_cache["refresh"] = refresh
        return access

    def _items_url(self, barcode: str) -> str:
        """YESPOS_URL ni olib, `key` parametrini barcode'ga almashtiradi."""
        parsed = urlparse(setting.YESPOS_URL)
        query = parse_qs(parsed.query)
        query["key"] = [barcode]
        # parse_qs qiymatlari ro'yxat — urlencode uchun yassilaymiz
        flat = {k: (v[0] if isinstance(v, list) else v) for k, v in query.items()}
        return urlunparse(parsed._replace(query=urlencode(flat)))

    async def _fetch_items(self, client: httpx.AsyncClient, barcode: str, token: str) -> dict:
        resp = await client.get(
            self._items_url(barcode),
            headers={"Authorization": f"Bearer {token}"},
            timeout=15,
        )
        return resp  # type: ignore[return-value]

    async def search_by_barcode(self, barcode: str) -> ProductInfo | None:
        self._require_config()
        barcode = barcode.strip()

        async with httpx.AsyncClient() as client:
            token = _token_cache["access"] or await self._signin(client)

            resp = await self._fetch_items(client, barcode, token)
            # Token eskirgan bo'lsa — bir marta qayta kirib, qaytadan urinamiz
            if resp.status_code in (401, 403):
                token = await self._signin(client)
                resp = await self._fetch_items(client, barcode, token)

            if resp.status_code >= 400:
                logger.error("YesPOS items xato %s: %s", resp.status_code, resp.text[:300])
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="YesPOS so'rovi muvaffaqiyatsiz")

            payload = resp.json()
            items = ((payload.get("data") or {}).get("items")) or payload.get("items") or []
            if not items:
                return None

            it = items[0]
            return ProductInfo(
                id=it.get("id"),
                name=it.get("name", ""),
                barcode=barcode,
                price=float(it.get("price") or 0),
                stock=float(it.get("stock") or 0),
                sku=str(it["sku"]) if it.get("sku") is not None else None,
                mxik=it.get("mxik"),
                unit_type=it.get("unit_type"),
            )
