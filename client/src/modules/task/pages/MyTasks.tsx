import { useMemo, useState } from "react";
import { Calendar, CheckCircle, AlertCircle, Play, RotateCcw, ClipboardList } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useMyTasks, useUpdateTaskStatus } from "../hooks/use-tasks";
import {
  PRIORITY_LABEL, PRIORITY_STYLE, PRIORITY_ORDER,
  STATUS_LABEL, STATUS_STYLE, isOverdue,
} from "../constants/labels";
import type { TaskStatus } from "../types";

const TABS: { key: "all" | TaskStatus; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "todo", label: "Bajarilmagan" },
  { key: "in_progress", label: "Jarayonda" },
  { key: "done", label: "Bajarildi" },
];

export function MyTasks() {
  const [tab, setTab] = useState<"all" | TaskStatus>("all");
  const { data: tasks = [], isLoading, isError } = useMyTasks();
  const updateStatus = useUpdateTaskStatus();

  const counts = useMemo(() => ({
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter((t) => isOverdue(t.due_date, t.status)).length,
  }), [tasks]);

  const filtered = useMemo(() => {
    const list = tab === "all" ? tasks : tasks.filter((t) => t.status === tab);
    return [...list].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }, [tasks, tab]);

  const setStatus = (id: string, status: TaskStatus) => updateStatus.mutate({ id, status });

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Vazifalarim</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Sizga biriktirilgan vazifalar</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Bajarilmagan", value: counts.todo, cls: "text-muted-foreground" },
          { label: "Jarayonda", value: counts.in_progress, cls: "text-warning" },
          { label: "Bajarildi", value: counts.done, cls: "text-success" },
          { label: "Muddati o'tgan", value: counts.overdue, cls: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-5">
            <div className={`text-xl sm:text-3xl font-black mb-1 tracking-tight ${s.cls}`}>{s.value}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-1 px-3 sm:px-5 pt-4 border-b border-slate-200/50 pb-0 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-2.5 sm:px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${tab === t.key ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-700"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">
          {isLoading ? (
            <EmptyState variant="loading" title="Yuklanmoqda…" />
          ) : isError ? (
            <EmptyState variant="error" title="Xatolik" description="Vazifalarni yuklab bo'lmadi" />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={tab === "all" ? "Vazifa yo'q" : "Bu filtrda vazifa yo'q"}
              description={tab === "all" ? "Hozircha sizga biriktirilgan vazifa yo'q" : undefined}
            />
          ) : (
            filtered.map((t) => {
              const overdue = isOverdue(t.due_date, t.status);
              return (
                <div key={t.id} className="p-4 rounded-xl border border-slate-200/50 hover:bg-slate-50 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-slate-900">{t.title}</h3>
                    <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[t.status]}`}>{STATUS_LABEL[t.status]}</span>
                  </div>
                  {t.description && <p className="text-xs text-slate-500 mb-2.5 leading-relaxed">{t.description}</p>}
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_STYLE[t.priority]}`}>{PRIORITY_LABEL[t.priority]}</span>
                    <span className={`flex items-center gap-1 text-xs ${overdue ? "text-destructive font-semibold" : "text-slate-400"}`}>
                      <Calendar size={11} /> Muddati: {t.due_date}
                    </span>
                    {overdue && (
                      <span className="flex items-center gap-1 text-[10px] text-destructive uppercase font-bold tracking-wider border border-destructive/20 bg-destructive/10 px-1.5 py-0.5 rounded-lg">
                        <AlertCircle size={10} /> Muddati o'tgan
                      </span>
                    )}
                  </div>

                  {/* Status amallari */}
                  <div className="flex items-center gap-2">
                    {t.status === "todo" && (
                      <button onClick={() => setStatus(t.id, "in_progress")} disabled={updateStatus.isPending}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 min-h-[44px] rounded-lg bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 active:scale-95 transition-all disabled:opacity-50">
                        <Play size={13} /> Boshlash
                      </button>
                    )}
                    {t.status === "in_progress" && (
                      <button onClick={() => setStatus(t.id, "done")} disabled={updateStatus.isPending}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 min-h-[44px] rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 active:scale-95 transition-all disabled:opacity-50">
                        <CheckCircle size={13} /> Bajarildi
                      </button>
                    )}
                    {t.status === "done" && (
                      <>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold uppercase tracking-wider">
                          <CheckCircle size={13} /> Yakunlandi
                        </span>
                        <button onClick={() => setStatus(t.id, "in_progress")} disabled={updateStatus.isPending}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2.5 min-h-[44px] rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50">
                          <RotateCcw size={12} /> Qayta ochish
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
