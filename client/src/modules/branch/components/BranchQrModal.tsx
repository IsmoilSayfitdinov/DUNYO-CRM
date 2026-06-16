import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Branch } from "@/modules/branch";

/**
 * Filial QR kodi. Skaner QR ichidan filial UUID'sini o'qiydi
 * (Scanner.tsx parseBranchId), shuning uchun QR ichiga filial id'sini yozamiz.
 */
export function BranchQrModal({ open, branch, onClose }: { open: boolean; branch: Branch | null; onClose: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  if (!open || !branch) return null;

  const download = () => {
    const canvas = wrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `QR-${branch.name.replace(/\s+/g, "_")}.png`;
    a.click();
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(branch.id);
      setCopied(true);
      toast.success("Filial ID nusxalandi");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Nusxalab bo'lmadi");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] sm:max-h-none flex flex-col animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        {/* Mobil drag handle — bottom-sheet ko'rinishi */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <span className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200/50">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Filial QR kodi</h3>
            <p className="text-sm text-slate-400 mt-0.5">Filial kirishiga osish uchun QR kod</p>
          </div>
          <button onClick={onClose} aria-label="Yopish" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center">
          {/* QR */}
          <div ref={wrapRef} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <QRCodeCanvas value={branch.id} size={220} level="M" includeMargin={false} />
          </div>

          <h4 className="mt-4 text-lg font-bold text-slate-900">{branch.name}</h4>
          <p className="text-xs text-slate-400 mt-1">
            Bu QR kodni chop etib, filial kirishiga osib qo'ying. Xodimlar shuni skanerlab kelish-ketishni qayd etadi.
          </p>

          {/* ID + copy */}
          <button
            onClick={copyId}
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-all"
            title="Filial ID nusxalash"
          >
            {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
            {branch.id}
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/80 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <button
            onClick={download}
            className="flex-1 px-5 py-2.5 sm:py-2 text-sm rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
          >
            <Download size={16} /> PNG yuklab olish
          </button>
        </div>
      </div>
    </div>
  );
}
