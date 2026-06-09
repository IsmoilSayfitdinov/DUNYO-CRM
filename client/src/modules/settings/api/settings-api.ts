import { apiClient } from "@/shared/lib/api";
import type { UserSettings, UserSettingsUpdate } from "../types";

export const settingsApi = {
  /** GET /settings/me — joriy foydalanuvchi sozlamalari (yo'q bo'lsa default yaratiladi) */
  getMy: () => apiClient.get<UserSettings>("/settings/me").then((r) => r.data),

  /** PATCH /settings/me — sozlamalarni yangilash */
  update: (patch: UserSettingsUpdate) =>
    apiClient.patch<UserSettings>("/settings/me", patch).then((r) => r.data),
};
