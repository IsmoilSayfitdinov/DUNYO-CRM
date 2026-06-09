from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.model.user import User
from app.schemas.product import ProductInfo
from app.services.product_services import YesPosService

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/by-barcode/{barcode}", response_model=ProductInfo)
async def get_product_by_barcode(
    barcode: str,
    user: User = Depends(get_current_user),
    service: YesPosService = Depends(),
):
    product = await service.search_by_barcode(barcode)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mahsulot topilmadi")
    return product
