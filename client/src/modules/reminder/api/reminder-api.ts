import { apiClient } from "@/shared/lib/api";
import type { Reminder, ReminderWithEmployee, ReminderCreate } from "../types";

export const reminderApi = {
  /** POST /reminders — rahbar xodimga eslatma/ogohlantirish yuboradi */
  create: (payload: ReminderCreate) =>
    apiClient.post<Reminder>("/reminders", payload).then((r) => r.data),

  /** GET /reminders — rahbar: o'zi yuborgan barcha eslatmalar */
  listTeam: () =>
    apiClient.get<ReminderWithEmployee[]>("/reminders").then((r) => r.data),

  /** DELETE /reminders/{id} — rahbar o'z eslatmasini o'chiradi */
  delete: (id: string) =>
    apiClient.delete<void>(`/reminders/${id}`).then((r) => r.data),

  /** GET /reminders/me — xodim: o'ziga kelgan eslatmalar */
  listMine: () =>
    apiClient.get<Reminder[]>("/reminders/me").then((r) => r.data),

  /** PATCH /reminders/{id}/read — xodim eslatmani o'qilgan deb belgilaydi */
  markRead: (id: string) =>
    apiClient.patch<Reminder>(`/reminders/${id}/read`).then((r) => r.data),
};
