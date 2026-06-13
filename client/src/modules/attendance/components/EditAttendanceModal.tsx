import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Davomatni tahrirlash" className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Davomatni tahrirlash</h3>
              <p className="text-xs text-slate-400 mt-0.5">{record.date}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Yopish" className="p-2 -m-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
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

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200/50 bg-slate-50">
          <button onClick={onClose} className="w-full sm:w-auto px-4 py-2.5 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-white transition-all">Bekor qilish</button>
          <button onClick={handleSave} className="w-full sm:w-auto px-5 py-2.5 text-sm rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-all">
            O'zgarishlarni saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
