from pydantic import BaseModel


class ProductInfo(BaseModel):
    """YesPOS mahsulotining frontend uchun soddalashtirilgan ko'rinishi."""
    id: int
    name: str
    barcode: str           # qidirilgan barcode (key)
    price: float
    stock: float = 0
    sku: str | None = None
    mxik: str | None = None
    unit_type: int | None = None
