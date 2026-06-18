import { useMemo, useState } from "react";
import { Plus, ClipboardList, Calendar, Trash2, User } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ConfirmActionModal } from "@/shared/ui/ConfirmActionModal";
import { useEmployees } from "@/modules/employee";
import { TaskFormModal } from "../components/TaskFormModal";
import { useTeamTasks, useCreateTask, useDeleteTask } from "../hooks/use-tasks";
import {
  PRIORITY_LABEL, PRIORITY_STYLE, PRIORITY_ORDER,
  STATUS_LABEL, STATUS_STYLE, isOverdue,
} from "../constants/labels";
import type { TaskStatus, TaskWithEmployee } from "../types";

const TABS: { key: "all" | TaskStatus; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "todo", label: "Bajarilmagan" },
  { key: "in_progress", label: "Jarayonda" },
  { key: "done", label: "Bajarildi" },
];

export function ManagerTasks() {
  const [tab, setTab] = useState<"all" | TaskStatus>("all");
  const [showNew, setShowNew] = useState(false);
  const [deleting, setDeleting] = useState<TaskWithEmployee | null>(null);

  const { data: tasks = [], isLoading, isError } = useTeamTasks();
  const { data: employeesData } = useEmployees({ limit: 100 });
  const employees = employeesData?.items ?? [];
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();

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

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Vazifalar</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Xodimlarga vazifa biriktiring va kuzating</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={16} /> Yangi vazifa
        </button>
      </div>

      {/* Stats */}
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

      {/* Tabs + list */}
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
              description={tab === "all" ? "Birinchi vazifani yaratish uchun «Yangi vazifa» bosing" : undefined}
            />
          ) : (
            filtered.map((t) => {
              const overdue = isOverdue(t.due_date, t.status);
              return (
                <div key={t.id} className="p-4 rounded-xl border border-slate-200/50 hover:bg-slate-50 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-slate-900">{t.title}</h3>
                    <button
                      onClick={() => setDeleting(t)}
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0"
                      title="O'chirish"
                      aria-label="Vazifani o'chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {t.description && <p className="text-xs text-slate-500 mb-2.5 leading-relaxed">{t.description}</p>}
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[t.status]}`}>{STATUS_LABEL[t.status]}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_STYLE[t.priority]}`}>{PRIORITY_LABEL[t.priority]}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400"><User size={11} /> {t.employee_name}</span>
                    <span className={`flex items-center gap-1 text-xs ${overdue ? "text-destructive font-semibold" : "text-slate-400"}`}>
                      <Calendar size={11} /> {t.due_date}{overdue ? " — muddati o'tgan" : ""}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <TaskFormModal
        open={showNew}
        onClose={() => setShowNew(false)}
        employees={employees}
        busy={createTask.isPending}
        onConfirm={(payload) => createTask.mutate(payload, { onSuccess: () => setShowNew(false) })}
      />

      <ConfirmActionModal
        open={!!deleting}
        busy={deleteTask.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteTask.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
        title="Vazifani o'chirish"
        description={deleting ? `«${deleting.title}» vazifasi o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.` : ""}
        confirmLabel="O'chirish"
        cancelLabel="Bekor qilish"
        variant="danger"
      />
    </div>
  );
}
