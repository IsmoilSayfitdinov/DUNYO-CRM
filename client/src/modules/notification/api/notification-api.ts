import { apiClient } from "@/shared/lib/api";
import type { AppNotification } from "../types";

export const notificationApi = {
  getMy: (limit = 50) =>
    apiClient.get<AppNotification[]>("/notifications/me", { params: { limit } }).then((r) => r.data),

  unreadCount: () =>
    apiClient.get<{ count: number }>("/notifications/me/unread-count").then((r) => r.data.count),

  markRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    apiClient.post("/notifications/read-all").then((r) => r.data),
};
