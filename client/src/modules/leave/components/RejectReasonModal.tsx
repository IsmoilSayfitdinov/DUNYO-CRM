import React, { useState } from "react";
import { X } from "lucide-react";

interface RejectReasonModalProps {
  open: boolean;
  employeeName: string;
  leaveType: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function RejectReasonModal({ open, employeeName, leaveType, onConfirm, onClose }: RejectReasonModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleConfirm = () => {
    if (!reason.trim()) { setError("Iltimos, rad etish sababini kiriting"); return; }
    onConfirm(reason.trim());
    setReason("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] sm:max-h-none flex flex-col">
        {/* Mobil drag handle — bottom-sheet ko'rinishi */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <span className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200/50">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Ta'til so'rovini rad etish</h3>
            <p className="text-sm text-slate-400 mt-0.5">{employeeName} · {leaveType}</p>
          </div>
          <button onClick={handleClose} aria-label="Yopish" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Rad etish sababi <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(""); }}
            rows={4}
            placeholder="Ushbu ta'til so'rovi nima uchun rad etilayotganini tushuntiring…"
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all resize-none"
          />
          {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
          <p className="text-xs text-slate-400 mt-2">Bu xabar xodimga bildirishnomasida ko'rinadi.</p>
        </div>
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/80 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <button onClick={handleClose} className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50 font-medium">Bekor qilish</button>
          <button onClick={handleConfirm} className="flex-[1.5] sm:flex-none px-5 py-2.5 sm:py-2 text-sm rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 sm:min-w-[130px] shadow-lg shadow-red-600/25">
            So'rovni rad etish
          </button>
        </div>
      </div>
    </div>
  );
}
