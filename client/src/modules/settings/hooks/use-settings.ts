import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsApi } from "../api/settings-api";
import { settingsKeys } from "../api/query-keys";
import type { UserSettings, UserSettingsUpdate } from "../types";

/** Joriy foydalanuvchi sozlamalari */
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.me(),
    queryFn: settingsApi.getMy,
  });
}

/** Sozlamalarni yangilash (optimistik — toggle darhol aks etadi, xatoda qaytariladi) */
export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: UserSettingsUpdate) => settingsApi.update(patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: settingsKeys.me() });
      const prev = qc.getQueryData<UserSettings>(settingsKeys.me());
      if (prev) qc.setQueryData(settingsKeys.me(), { ...prev, ...patch });
      return { prev };
    },
    onError: (_e, _patch, ctx) => {
      if (ctx?.prev) qc.setQueryData(settingsKeys.me(), ctx.prev);
      toast.error("Sozlamani saqlab bo'lmadi");
    },
    onSuccess: (data) => qc.setQueryData(settingsKeys.me(), data),
  });
}
