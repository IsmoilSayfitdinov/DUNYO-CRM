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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isWarning ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
              {isWarning ? <AlertTriangle size={20} /> : <Bell size={20} />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Xodimga eslatma</h3>
              <p className="text-xs text-slate-400">Xodimga xabar/ogohlantirish yuboring</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Severity toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSeverity("warning")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${isWarning ? "bg-white text-amber-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
            >
              <AlertTriangle size={16} /> Ogohlantirish
            </button>
            <button
              onClick={() => setSeverity("info")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${!isWarning ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
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
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          <div className={`p-3 rounded-xl border text-xs leading-relaxed ${isWarning ? "bg-amber-50/50 border-amber-100 text-amber-800" : "bg-blue-50/50 border-blue-100 text-blue-800"}`}>
            Eslatma xodimga darhol push-bildirishnoma sifatida boradi.
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-200/50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl transition-all">
            Bekor qilish
          </button>
          <button
            onClick={handleConfirm}
            disabled={!valid || busy}
            className={`px-6 py-2 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none ${isWarning ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"}`}
          >
            {busy ? "Yuborilmoqda…" : "Yuborish"}
          </button>
        </div>
      </div>
    </div>
  );
}
