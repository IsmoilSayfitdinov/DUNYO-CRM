import { Bell, AlertTriangle, Check, Clock } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/skeleton";
import { useMyReminders, useMarkReminderRead } from "../hooks/use-reminders";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Xodim sahifasida ko'rsatiladigan "Rahbar eslatmalari" bloki. */
export function MyRemindersCard() {
  const { data: reminders = [], isLoading } = useMyReminders();
  const markRead = useMarkReminderRead();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }
  if (reminders.length === 0) return null;

  const unread = reminders.filter((r) => !r.is_read).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          Rahbar eslatmalari
          {unread > 0 && (
            <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">{unread} ta yangi</span>
          )}
        </h3>
      </div>
      <div className="space-y-2">
        {reminders.map((r) => {
          const warning = r.severity === "warning";
          return (
            <div
              key={r.id}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${r.is_read ? "bg-slate-50 border-slate-200/50" : warning ? "bg-amber-50/60 border-amber-200" : "bg-blue-50/60 border-blue-200"}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${warning ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
                {warning ? <AlertTriangle size={16} /> : <Bell size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800">{r.title}</div>
                {r.message && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{r.message}</p>}
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1"><Clock size={10} /> {fmt(r.created_at)}</div>
              </div>
              {!r.is_read && (
                <button
                  onClick={() => markRead.mutate(r.id)}
                  disabled={markRead.isPending}
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-2 min-h-[40px] rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-all disabled:opacity-50"
                >
                  <Check size={12} /> O'qildi
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Bo'sh holatni alohida chaqirish kerak bo'lsa (sahifa darajasida)
export function MyRemindersEmpty() {
  return <EmptyState icon={Bell} title="Eslatma yo'q" description="Rahbardan eslatma kelmagan" />;
}
