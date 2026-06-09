import { useQuery } from "@tanstack/react-query";
import { productApi } from "../api/product-api";

/** Barcode bo'yicha mahsulot qidirish (faqat barcode berilganda ishlaydi). */
export function useProductByBarcode(barcode: string) {
  return useQuery({
    queryKey: ["product", "barcode", barcode],
    queryFn: () => productApi.getByBarcode(barcode),
    enabled: !!barcode,
    retry: false, // 404 (topilmadi) qayta urinmaydi
    staleTime: 60_000,
  });
}
