import React from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface ConfirmActionModalProps {
  open: boolean;
  variant?: "danger" | "warning" | "confirm";
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmActionModal({
  open,
  variant = "danger",
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  if (!open) return null;

  const cfg = {
    danger:  { icon: <Trash2 size={20} className="text-red-600" />, iconBg: "bg-red-100", btn: "bg-red-600 hover:bg-red-700", borderTop: "border-red-100" },
    warning: { icon: <AlertTriangle size={20} className="text-amber-600" />, iconBg: "bg-amber-100", btn: "bg-amber-600 hover:bg-amber-700", borderTop: "border-amber-100" },
    confirm: { icon: <AlertTriangle size={20} className="text-primary" />, iconBg: "bg-primary/10", btn: "bg-primary hover:bg-primary/90", borderTop: "border-primary/10" },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-start gap-4 p-4 sm:p-6">
          <div className={`w-12 h-12 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0`}>
            {cfg.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className={`flex flex-col sm:flex-row items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t ${cfg.borderTop} bg-slate-50`}>
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-white transition-all">
            {cancelLabel}
          </button>
          <button onClick={() => { onConfirm(); onClose(); }}
            className={`px-5 py-2 text-sm rounded-lg font-medium text-slate-900 transition-all ${cfg.btn}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
