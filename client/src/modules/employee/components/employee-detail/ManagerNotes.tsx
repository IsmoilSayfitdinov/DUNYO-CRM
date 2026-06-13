import { useState } from "react";
import { Trash2, AlertTriangle, Bell, Loader2 } from "lucide-react";
import { useTeamReminders, useCreateReminder, useDeleteReminder, type ReminderSeverity } from "@/modules/reminder";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" });

const initials = (name: string) =>
  name.split(" ").map((x) => x[0]).filter(Boolean).join("").slice(0, 2).toUpperCase();

interface ManagerNotesProps {
  employeeId: string;
  employeeName?: string;
}

/**
 * Rahbar eslatmalari — bitta xodim uchun. Real backend (/reminders) ga ulangan:
 * rahbar barcha eslatmalaridan shu xodimnikini filtrlaymiz, yangi eslatma/ogohlantirish
 * yuboramiz va o'chiramiz. Xodim o'z tomonida bularni "Bildirishnomalar"da ko'radi.
 */
export function ManagerNotes({ employeeId, employeeName }: ManagerNotesProps) {
  const { data: allReminders, isLoading } = useTeamReminders();
  const createReminder = useCreateReminder();
  const deleteReminder = useDeleteReminder();

  const [text, setText] = useState("");
  const [severity, setSeverity] = useState<ReminderSeverity>("info");

  // Rahbarning barcha eslatmalaridan faqat shu xodimnikini olamiz (yangi birinchi).
  const notes = (allReminders ?? [])
    .filter((r) => r.employee_id === employeeId)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  const submit = () => {
    const title = text.trim();
    if (!title) return;
    createReminder.mutate(
      { employee_id: employeeId, title, severity },
      { onSuccess: () => { setText(""); setSeverity("info"); } }
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5">
      <h3 className="font-semibold text-slate-900 mb-4">Rahbar eslatmalari</h3>

      {/* Ro'yxat */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 size={18} className="animate-spin mr-2" /> Yuklanmoqda…
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">
            Hali eslatma yo'q. Quyida birinchisini qo'shing.
          </div>
        ) : (
          notes.map((n) => {
            const warn = n.severity === "warning";
            return (
              <div
                key={n.id}
                className={`group flex gap-3 p-4 rounded-2xl border shadow-sm ${
                  warn ? "bg-amber-50 border-amber-200/60" : "bg-slate-50 border-slate-200/50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${
                    warn ? "bg-amber-500 shadow-amber-500/20" : "bg-primary shadow-primary/20"
                  }`}
                >
                  {warn ? <AlertTriangle size={16} /> : <Bell size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-800 truncate">
                      {employeeName ?? "Xodim"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                      {fmtDate(n.created_at)}
                    </span>
                    {!n.is_read && (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                        yangi
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium break-words">{n.title}</p>
                  {n.message && <p className="text-xs text-slate-400 mt-1">{n.message}</p>}
                </div>
                <button
                  onClick={() => deleteReminder.mutate(n.id)}
                  disabled={deleteReminder.isPending}
                  className="self-start p-2 -m-1 rounded-lg text-slate-400 hover:text-destructive hover:bg-destructive/10 transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label="O'chirish"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Severity tanlash */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setSeverity("info")}
          className={`flex items-center gap-1.5 px-3 py-2.5 min-h-[40px] rounded-lg text-xs font-semibold transition-all ${
            severity === "info" ? "bg-primary text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          <Bell size={13} /> Eslatma
        </button>
        <button
          onClick={() => setSeverity("warning")}
          className={`flex items-center gap-1.5 px-3 py-2.5 min-h-[40px] rounded-lg text-xs font-semibold transition-all ${
            severity === "warning" ? "bg-amber-500 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          <AlertTriangle size={13} /> Ogohlantirish
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit(); }}
        maxLength={200}
        className="w-full mt-3 p-4 text-sm border border-slate-200 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-slate-400 resize-none min-h-[100px]"
        placeholder={severity === "warning" ? "Ogohlantirish matni..." : "Menejer eslatmasini qo'shish..."}
        rows={3}
      />

      <button
        onClick={submit}
        disabled={!text.trim() || createReminder.isPending}
        className="mt-3 px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
      >
        {createReminder.isPending && <Loader2 size={15} className="animate-spin" />}
        {severity === "warning" ? "Ogohlantirish yuborish" : "Eslatmani qo'shish"}
      </button>
    </div>
  );
}
