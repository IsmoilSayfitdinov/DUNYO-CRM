/** ISO datetime ("2026-06-04T08:41:25Z") → local "08:41" (24h) */
export const toHHMM = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
};

/** Raqamni mingliklarga ajratib qaytaradi: 15000 → "15 000" */
export const formatMoney = (n: number | string) =>
  String(n ?? "").replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/** So'mда formatlangan: 15000 → "15 000 so'm" */
export const formatSom = (n: number | string) => `${Number(n || 0).toLocaleString()} so'm`;

/** "M UZS" ko'rinishi: 3000000 → "3.00M UZS" */
export const formatMillion = (n: number | string) => `${(Number(n || 0) / 1_000_000).toFixed(2)}M UZS`;
