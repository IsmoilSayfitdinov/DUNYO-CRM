import { AlertTriangle } from "lucide-react";

export function ScannerTips() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-5">
      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
        <AlertTriangle size={14} className="text-amber-500" /> Maslahatlar
      </h4>
      <ul className="space-y-2">
        {[
          "Barkodni kameradan 10–20 sm uzoqlikda ushlang",
          "Yorug'lik yetarli bo'lishiga e'tibor bering",
          "EAN-13, UPC, CODE-128 va QR kodlar qo'llab-quvvatlanadi",
          "Kod o'qilmasa, qo'lda barkod raqamini kiriting",
        ].map((tip, i) => (
          <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
