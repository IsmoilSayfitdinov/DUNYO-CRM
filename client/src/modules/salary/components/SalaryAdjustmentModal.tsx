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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-white/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBonus ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {isBonus ? <Award size={20} /> : <CreditCard size={20} />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {isBonus ? "Premiya qo'shish" : "Avans berish"}
              </h3>
              <p className="text-xs text-slate-400">{employeeName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
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

        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-700/50 rounded-xl transition-all"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleConfirm}
            disabled={!amount || busy}
            className={`px-6 py-2 text-sm font-bold text-slate-900 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none ${isBonus ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}`}
          >
            {busy ? "Saqlanmoqda…" : "Tasdiqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}
