export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "done";

/** GET /tasks/* qaytaradigan vazifa. */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  employee_id: string;
  created_by: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string; // "YYYY-MM-DD"
  completed_at: string | null;
  created_at: string;
}

/** GET /tasks (rahbar ro'yxati) — xodim ismi bilan. */
export interface TaskWithEmployee extends Task {
  employee_name: string;
}

/** POST /tasks tanasi — rahbar yangi vazifa yaratadi. */
export interface TaskCreate {
  employee_id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  due_date: string; // "YYYY-MM-DD"
}
