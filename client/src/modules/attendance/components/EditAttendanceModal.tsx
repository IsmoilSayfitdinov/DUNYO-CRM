import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import CustomSelect from "@/shared/ui/CustomSelect";
import { TimePicker } from "@/shared/ui/TimePicker";

// value'lar STATUS_TO_BACKEND kalitlariga mos (Sababli=pulli max2, Ta'tilda=pulsiz)
const ATTENDANCE_STATUS_OPTIONS = [
  { value: "Keldi", label: "Keldi" },
  { value: "Kechikdi", label: "Kechikdi" },
  { value: "Kelmadi", label: "Kelmadi" },
  { value: "Sababli", label: "Sababli (pul to'lanadi, max 2 kun)" },
  { value: "Ta'tilda", label: "Ta'tilda (pulsiz)" },
];

export function EditAttendanceModal({ open, record, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    status: "",
    notes: "",
  });

  useEffect(() => {
    if (record) {
      setFormData({
        checkIn: record.checkIn || "",
        checkOut: record.checkOut || "",
        // Select qiymati badge label bo'lishi kerak (backend xom statusi emas),
        // aks holda dropdown joriy qiymatni ko'rsatmaydi.
        status: record.badge || record.status || "Kelmadi",
        notes: record.notes || "",
      });
    }
  }, [record]);

  if (!open || !record) return null;

  // Chiqish vaqti kirishdan "oldin" bo'lsa — bu TUNGI SMENA (chiqish keyingi kunга
  // o'tadi), xato emas. Masalan: 16:00 → 00:00 = ~8 soat.
  const isOvernight = !!(formData.checkIn && formData.checkOut && formData.checkOut < formData.checkIn);

  const handleSave = () => {
    onSave({ ...record, ...formData });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Davomatni tahrirlash" className="relative w-full max-w-full sm:max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200">
        {/* Mobil drag handle — bottom-sheet ko'rinishi */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <span className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200/50">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Davomatni tahrirlash</h3>
            <p className="text-sm text-slate-400 mt-0.5">{record.date}</p>
          </div>
          <button onClick={onClose} aria-label="Yopish" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0">
            <X size={16} />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Kirish</label>
              <TimePicker value={formData.checkIn} onChange={(v) => setFormData({ ...formData, checkIn: v })} placeholder="Kirish vaqti" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Chiqish</label>
              <TimePicker value={formData.checkOut} onChange={(v) => setFormData({ ...formData, checkOut: v })} placeholder="Chiqish vaqti" />
            </div>
          </div>
          <CustomSelect
            label="Holati"
            options={ATTENDANCE_STATUS_OPTIONS}
            value={formData.status}
            onValueChange={(val) => setFormData({ ...formData, status: val })}
          />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Izoh</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Ixtiyoriy izoh"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all bg-white resize-none"
            />
          </div>
          {isOvernight && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Tungi smena — chiqish keyingi kunга hisoblanadi
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/80 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <button onClick={onClose} className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50 font-medium">Bekor qilish</button>
          <button onClick={handleSave} className="flex-[1.5] sm:flex-none px-5 py-2.5 sm:py-2 text-sm rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 sm:min-w-[130px] shadow-lg shadow-primary/25">
            O'zgarishlarni saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
