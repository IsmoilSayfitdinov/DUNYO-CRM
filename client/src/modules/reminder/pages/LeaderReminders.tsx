import { useState } from "react";
import { Plus, Bell, AlertTriangle, Trash2, User, Clock } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ConfirmActionModal } from "@/shared/ui/ConfirmActionModal";
import { useEmployees } from "@/modules/employee";
import { ReminderFormModal } from "../components/ReminderFormModal";
import { useTeamReminders, useCreateReminder, useDeleteReminder } from "../hooks/use-reminders";
import type { ReminderWithEmployee } from "../types";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function LeaderReminders() {
  const [showNew, setShowNew] = useState(false);
  const [deleting, setDeleting] = useState<ReminderWithEmployee | null>(null);

  const { data: reminders = [], isLoading, isError } = useTeamReminders();
  const { data: employeesData } = useEmployees({ limit: 100 });
  const employees = employeesData?.items ?? [];
  const createReminder = useCreateReminder();
  const deleteReminder = useDeleteReminder();

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Rahbar eslatmalari</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Xodimlarga eslatma va ogohlantirish yuboring</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={16} /> Yangi eslatma
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <EmptyState variant="loading" title="Yuklanmoqda…" />
          ) : isError ? (
            <EmptyState variant="error" title="Xatolik" description="Eslatmalarni yuklab bo'lmadi" />
          ) : reminders.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Eslatma yo'q"
              description="Xodimga eslatma yuborish uchun «Yangi eslatma» bosing"
            />
          ) : (
            reminders.map((r) => {
              const warning = r.severity === "warning";
              return (
                <div key={r.id} className="p-4 rounded-xl border border-slate-200/50 hover:bg-slate-50 transition-all">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${warning ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
                      {warning ? <AlertTriangle size={17} /> : <Bell size={17} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">{r.title}</h3>
                        <button
                          onClick={() => setDeleting(r)}
                          className="w-10 h-10 -mt-2 -mr-1 flex items-center justify-center text-slate-300 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0"
                          title="O'chirish"
                          aria-label="Eslatmani o'chirish"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {r.message && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.message}</p>}
                      <div className="flex items-center flex-wrap gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-slate-400"><User size={11} /> {r.employee_name}</span>
                        <span className="flex items-center gap-1 text-xs text-slate-400"><Clock size={11} /> {fmt(r.created_at)}</span>
                        {r.is_read && <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">O'qildi</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ReminderFormModal
        open={showNew}
        onClose={() => setShowNew(false)}
        employees={employees}
        busy={createReminder.isPending}
        onConfirm={(payload) => createReminder.mutate(payload, { onSuccess: () => setShowNew(false) })}
      />

      <ConfirmActionModal
        open={!!deleting}
        busy={deleteReminder.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteReminder.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
        title="Eslatmani o'chirish"
        description={deleting ? `«${deleting.title}» eslatmasi o'chiriladi.` : ""}
        confirmLabel="O'chirish"
        cancelLabel="Bekor qilish"
        variant="danger"
      />
    </div>
  );
}
