import { useEffect, useMemo, useState } from "react";
import { X, Bell, AlertTriangle, User, MessageSquare } from "lucide-react";
import { CustomSelect } from "@/shared/ui/CustomSelect";
import type { Employee } from "@/modules/employee";
import type { ReminderCreate, ReminderSeverity } from "../types";

interface ReminderFormModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: ReminderCreate) => void;
  employees: Employee[];
  busy?: boolean;
  /** Modal ochilganda oldindan tanlangan xodim (ixtiyoriy) */
  defaultEmployeeId?: string;
}

function employeeName(e: Employee): string {
  const u = e.user;
  return `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim() || u?.username || "Xodim";
}

export function ReminderFormModal({ open, onClose, onConfirm, employees, busy = false, defaultEmployeeId = "" }: ReminderFormModalProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<ReminderSeverity>("warning");

  useEffect(() => {
    if (open) {
      setEmployeeId(defaultEmployeeId);
      setTitle("");
      setMessage("");
      setSeverity("warning");
    }
  }, [open, defaultEmployeeId]);

  const employeeOptions = useMemo(
    () => employees.map((e) => ({ value: e.id, label: employeeName(e) })),
    [employees]
  );

  if (!open) return null;

  const isWarning = severity === "warning";
  const valid = employeeId && title.trim();

  const handleConfirm = () => {
    if (!valid) return;
    onConfirm({
      employee_id: employeeId,
      title: title.trim(),
      message: message.trim() || null,
      severity,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[92vh] sm:max-h-none flex flex-col">
        {/* Mobil drag handle — bottom-sheet ko'rinishi */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <span className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200/50">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Xodimga eslatma</h3>
            <p className="text-sm text-slate-400 mt-0.5">Xodimga xabar/ogohlantirish yuboring</p>
          </div>
          <button onClick={onClose} aria-label="Yopish" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 sm:max-h-[70vh] overflow-y-auto">
          {/* Severity toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSeverity("warning")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 min-h-[44px] text-sm font-medium rounded-lg transition-all ${isWarning ? "bg-white text-amber-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
            >
              <AlertTriangle size={16} /> Ogohlantirish
            </button>
            <button
              onClick={() => setSeverity("info")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 min-h-[44px] text-sm font-medium rounded-lg transition-all ${!isWarning ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
            >
              <Bell size={16} /> Oddiy eslatma
            </button>
          </div>

          {/* Employee */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1.5"><User size={14} /> Xodim</label>
            <CustomSelect options={employeeOptions} value={employeeId} onValueChange={setEmployeeId} placeholder="Xodimni tanlang" />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sarlavha</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isWarning ? "Masalan: Kechikish haqida" : "Masalan: Eslatma"}
              maxLength={200}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Message */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1.5"><MessageSquare size={14} /> Xabar (ixtiyoriy)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Batafsil yozing..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          <div className={`p-3 rounded-xl border text-xs leading-relaxed ${isWarning ? "bg-amber-50/50 border-amber-100 text-amber-800" : "bg-blue-50/50 border-blue-100 text-blue-800"}`}>
            Eslatma xodimga darhol push-bildirishnoma sifatida boradi.
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/80 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <button onClick={onClose} className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50 font-medium">
            Bekor qilish
          </button>
          <button
            onClick={handleConfirm}
            disabled={!valid || busy}
            className="flex-[1.5] sm:flex-none px-5 py-2.5 sm:py-2 text-sm rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 sm:min-w-[130px] shadow-lg shadow-primary/25"
          >
            {busy ? "Yuborilmoqda…" : "Yuborish"}
          </button>
        </div>
      </div>
    </div>
  );
}
