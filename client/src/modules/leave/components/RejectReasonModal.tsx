import React, { useState } from "react";
import { X, MessageSquare } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <MessageSquare size={18} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Ta'til so'rovini rad etish</h3>
              <p className="text-xs text-slate-400 mt-0.5">{employeeName} · {leaveType}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
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
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200/50 bg-slate-50">
          <button onClick={handleClose} className="px-4 py-2.5 min-h-[40px] text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-white transition-all">Bekor qilish</button>
          <button onClick={handleConfirm} className="px-5 py-2.5 min-h-[40px] text-sm rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-all">
            So'rovni rad etish
          </button>
        </div>
      </div>
    </div>
  );
}
