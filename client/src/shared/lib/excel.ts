import * as XLSX from "xlsx";

/**
 * Ob'ektlar massivini haqiqiy .xlsx faylga aylantirib, brauzerда yuklab oladi.
 * `rows` — har biri {ustun nomi: qiymat} ko'rinishida (kalitlar ustun sarlavhasi bo'ladi).
 */
export function downloadExcel(filename: string, sheetName: string, rows: Record<string, unknown>[]): void {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  // Excel varaq nomi maksimum 31 belgi + ba'zi belgilar taqiqlangan
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31).replace(/[\\/?*[\]:]/g, " "));
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
