import { apiClient } from "@/shared/lib/api";
import type { Product } from "../types";

export const productApi = {
  /** GET /products/by-barcode/{barcode} — YesPOS'dan mahsulot (backend proxy orqali) */
  getByBarcode: (barcode: string) =>
    apiClient.get<Product>(`/products/by-barcode/${encodeURIComponent(barcode)}`).then((r) => r.data),
};
