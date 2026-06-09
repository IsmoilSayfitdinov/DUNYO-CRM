import { Monitor, CheckCircle, Loader2 } from "lucide-react";
import { useSessions, useRevokeSession } from "@/modules/auth";
import { EmptyState } from "@/shared/ui/EmptyState";

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Hozir faol";
  if (m < 60) return `${m} daqiqa oldin`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} soat oldin`;
  return `${Math.floor(h / 24)} kun oldin`;
}

export function SessionsList() {
  const { data: sessions, isLoading } = useSessions();
  const revoke = useRevokeSession();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 text-slate-400">
        <Loader2 size={18} className="animate-spin" />
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <EmptyState
        size="sm"
        icon={Monitor}
        title="Faol seanslar yo'q"
        description="Hozircha boshqa qurilmalarda ochiq seanslar mavjud emas."
      />
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <div key={s.id} className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-slate-200/50">
          <div className="flex items-center gap-3 min-w-0">
            <Monitor size={16} className="text-slate-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-800 truncate">{s.device}</div>
              <div className="text-xs text-slate-400 truncate">
                {[s.ip_address, relTime(s.last_used_at)].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
          {s.is_current ? (
            <span className="shrink-0 text-[10px] bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle size={10} /> Joriy
            </span>
          ) : (
            <button
              onClick={() => revoke.mutate(s.id)}
              disabled={revoke.isPending}
              className="shrink-0 min-h-[40px] inline-flex items-center text-xs text-red-500 hover:text-red-700 transition-colors px-2 -mr-2 disabled:opacity-50"
            >
              Yakunlash
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
