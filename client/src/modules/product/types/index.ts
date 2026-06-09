/** GET /products/by-barcode/{barcode} javobi (YesPOS mahsuloti) */
export interface Product {
  id: number;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  sku?: string | null;
  mxik?: string | null;
  unit_type?: number | null;
}
