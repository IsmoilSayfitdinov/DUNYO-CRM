import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "../api/auth-api";

const sessionsKey = ["auth", "sessions"] as const;

/** Faol seanslar ro'yxati */
export function useSessions() {
  return useQuery({
    queryKey: sessionsKey,
    queryFn: authApi.getSessions,
  });
}

/** Seansni yakunlash (boshqa qurilmani chiqarish) */
export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authApi.revokeSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionsKey });
      toast.success("Seans yakunlandi");
    },
    onError: () => toast.error("Seansni yakunlab bo'lmadi"),
  });
}
