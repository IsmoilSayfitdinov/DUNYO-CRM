import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../api/notification-api";

const keys = {
  all: ["notifications"] as const,
  list: (limit: number) => ["notifications", "list", limit] as const,
  unread: ["notifications", "unread"] as const,
};

/** Mening bildirishnomalarim */
export function useNotifications(limit = 50) {
  return useQuery({
    queryKey: keys.list(limit),
    queryFn: () => notificationApi.getMy(limit),
  });
}

/** O'qilmaganlar soni (har 30 soniyada yangilanadi) */
export function useUnreadCount() {
  return useQuery({
    queryKey: keys.unread,
    queryFn: notificationApi.unreadCount,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
