import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Download, QrCode, Copy, Check } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <QrCode size={18} className="text-primary" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Filial QR kodi</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
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

        <div className="px-6 py-4 border-t border-slate-200/50 bg-slate-50">
          <button
            onClick={download}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-red-700 text-white text-sm font-bold rounded-xl hover:opacity-95 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            <Download size={16} /> PNG yuklab olish
          </button>
        </div>
      </div>
    </div>
  );
}
