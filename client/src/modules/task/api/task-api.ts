import { apiClient } from "@/shared/lib/api";
import type { Task, TaskWithEmployee, TaskCreate, TaskStatus } from "../types";

export const taskApi = {
  /** POST /tasks — rahbar xodimga vazifa yaratadi */
  create: (payload: TaskCreate) =>
    apiClient.post<Task>("/tasks", payload).then((r) => r.data),

  /** GET /tasks — rahbar: o'zi yaratgan barcha vazifalar (xodim ismi bilan) */
  listTeam: () =>
    apiClient.get<TaskWithEmployee[]>("/tasks").then((r) => r.data),

  /** DELETE /tasks/{id} — rahbar o'z vazifasini o'chiradi */
  delete: (id: string) =>
    apiClient.delete<void>(`/tasks/${id}`).then((r) => r.data),

  /** GET /tasks/me — xodim: o'ziga biriktirilgan vazifalar */
  listMine: () =>
    apiClient.get<Task[]>("/tasks/me").then((r) => r.data),

  /** PATCH /tasks/{id}/status — xodim vazifa holatini o'zgartiradi */
  updateStatus: (id: string, status: TaskStatus) =>
    apiClient.patch<Task>(`/tasks/${id}/status`, { status }).then((r) => r.data),
};
