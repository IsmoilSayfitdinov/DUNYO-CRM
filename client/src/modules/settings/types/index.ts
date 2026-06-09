/** Backend: GET/PATCH /settings/me (app/schemas/user_settings.py) */
export interface UserSettings {
  notify_sms: boolean;
  notify_push: boolean;
  notify_leave: boolean;
  notify_salary: boolean;
  notify_task: boolean;
  notify_attendance: boolean;
  two_factor_enabled: boolean;
  auto_logout: boolean;
}

export type UserSettingsUpdate = Partial<UserSettings>;
