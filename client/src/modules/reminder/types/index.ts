export type ReminderSeverity = "info" | "warning";

/** GET /reminders/* qaytaradigan eslatma/ogohlantirish. */
export interface Reminder {
  id: string;
  employee_id: string;
  created_by: string;
  title: string;
  message: string | null;
  severity: ReminderSeverity;
  is_read: boolean;
  created_at: string;
}

/** GET /reminders (rahbar ro'yxati) — xodim ismi bilan. */
export interface ReminderWithEmployee extends Reminder {
  employee_name: string;
}

/** POST /reminders tanasi — rahbar xodimga eslatma yuboradi. */
export interface ReminderCreate {
  employee_id: string;
  title: string;
  message?: string | null;
  severity: ReminderSeverity;
}
