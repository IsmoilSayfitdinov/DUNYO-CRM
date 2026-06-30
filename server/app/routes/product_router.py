from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.dependencies import get_current_user
from app.model.user import User
from app.schemas.product import ProductInfo
from app.services.product_services import YesPosService

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/by-barcode/{barcode}", response_model=ProductInfo)
async def get_product_by_barcode(
    # Barcode uzunligini cheklaymiz — tashqi YesPOS URL'iga uzatiladi, ulkan
    # qiymat URL uzunligi cheklovini buzib yoki tashqi API'ni cho'ktirib (DoS)
    # qo'yardi. EAN/UPC/QR uchun 64 belgi yetarli.
    barcode: str = Path(min_length=1, max_length=64),
    user: User = Depends(get_current_user),
    service: YesPosService = Depends(),
):
    product = await service.search_by_barcode(barcode)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mahsulot topilmadi")
    return product
