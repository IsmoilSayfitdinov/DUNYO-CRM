import React, { useState, useEffect } from "react";
import { X, DollarSign, Award, CreditCard, Calendar, MessageSquare } from "lucide-react";
import type { SalaryAdjustment } from "../types";

interface SalaryAdjustmentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (adjustment: { type: 'bonus' | 'advance', amount: number, reason: string }) => void;
  employeeName: string;
  defaultType?: 'bonus' | 'advance';
  /** Shu xodimning shu oydagi mavjud avans/premiyalari (ko'rinib turishi uchun) */
  adjustments?: SalaryAdjustment[];
  busy?: boolean;
}

export function SalaryAdjustmentModal({ open, onClose, onConfirm, employeeName, defaultType = 'bonus', adjustments = [], busy = false }: SalaryAdjustmentModalProps) {
  const [type, setType] = useState<'bonus' | 'advance'>(defaultType);
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setType(defaultType);
      setAmount("");
      setReason("");
    }
  }, [open, defaultType]);

  if (!open) return null;

  const handleConfirm = () => {
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    // Backend chegarasi: max_digits=10, decimal_places=2 -> <= 99 999 999.99
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > 99999999.99) return;

    onConfirm({
      type,
      amount: numAmount,
      reason
    });
    onClose();
  };

  const isBonus = type === 'bonus';

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-white/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[92vh] sm:max-h-none flex flex-col">
        {/* Mobil drag handle — bottom-sheet ko'rinishi */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <span className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200/50">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Ish haqi tuzatish</h3>
            <p className="text-sm text-slate-400 mt-0.5">{employeeName}</p>
          </div>
          <button onClick={onClose} aria-label="Yopish" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 flex-1 min-h-0 overflow-y-auto">
          {/* Type Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setType('bonus')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${isBonus ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
            >
              <Award size={16} /> Premiya
            </button>
            <button
              onClick={() => setType('advance')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${!isBonus ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
            >
              <CreditCard size={16} /> Avans
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Summa (UZS)</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <DollarSign size={16} />
              </div>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setAmount(val ? parseInt(val).toLocaleString() : "");
                }}
                placeholder="Masalan: 500,000"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Izoh (ixtiyoriy)</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400">
                <MessageSquare size={16} />
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Sababini yozing..."
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>
          </div>

          {/* Mavjud avans/premiyalar (ko'rinib turishi uchun) */}
          {adjustments.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Shu oydagi avans/premiyalar</label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {adjustments.map((a) => {
                  const bonus = a.type === "bonus";
                  return (
                    <div key={a.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bonus ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                          {bonus ? <Award size={14} /> : <CreditCard size={14} />}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-800 truncate">{a.note || (bonus ? "Premiya" : "Avans")}</div>
                          <div className="text-[10px] text-slate-400">{new Date(a.created_at).toLocaleDateString("uz-UZ")}</div>
                        </div>
                      </div>
                      <span className={`text-xs font-bold tabular-nums shrink-0 ${bonus ? "text-emerald-600" : "text-amber-600"}`}>
                        {bonus ? "+" : "−"}{Number(a.amount).toLocaleString("uz-UZ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className={`p-4 rounded-xl border flex gap-3 ${isBonus ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' : 'bg-amber-50/50 border-amber-100 text-amber-800'}`}>
            <div className="mt-0.5">
              <Calendar size={16} />
            </div>
            <div className="text-xs leading-relaxed">
              {isBonus 
                ? "Premiya joriy oyning yakuniy ish haqiga qo'shib hisoblanadi." 
                : "Avans miqdori joriy oyning yakuniy ish haqidan ayirib tashlanadi."}
              <br />
              <span className="font-bold opacity-80 mt-1 block">Sana: {new Date().toLocaleDateString('uz-UZ')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/80 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50 font-medium"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleConfirm}
            disabled={!amount || busy}
            className="flex-[1.5] sm:flex-none px-5 py-2.5 sm:py-2 text-sm rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 sm:min-w-[130px] shadow-lg shadow-primary/25"
          >
            {busy ? "Saqlanmoqda…" : "Tasdiqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}
