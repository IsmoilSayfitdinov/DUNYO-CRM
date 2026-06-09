import type { TaskPriority, TaskStatus } from "../types";

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  critical: "Kritik",
  high: "Yuqori",
  medium: "O'rta",
  low: "Past",
};

/** Tailwind ranglar (badge uchun). */
export const PRIORITY_STYLE: Record<TaskPriority, string> = {
  critical: "bg-red-50 text-red-600 border-red-100",
  high: "bg-orange-50 text-orange-600 border-orange-100",
  medium: "bg-blue-50 text-blue-600 border-blue-100",
  low: "bg-slate-100 text-slate-500 border-slate-200",
};

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Bajarilmagan",
  in_progress: "Jarayonda",
  done: "Bajarildi",
};

export const STATUS_STYLE: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-500 border-slate-200",
  in_progress: "bg-amber-50 text-amber-600 border-amber-100",
  done: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

/** Muddat o'tganmi (done bo'lmagan va due_date kechagan). */
export function isOverdue(dueDate: string, status: TaskStatus): boolean {
  if (status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}
