import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reminderApi } from "../api/reminder-api";
import { reminderKeys } from "../api/query-keys";
import type { ReminderCreate } from "../types";

/** Rahbar: o'zi yuborgan barcha eslatmalar (xodim ismi bilan). */
export function useTeamReminders() {
  return useQuery({ queryKey: reminderKeys.team(), queryFn: reminderApi.listTeam });
}

/** Xodim: o'ziga kelgan eslatmalar. */
export function useMyReminders() {
  return useQuery({ queryKey: reminderKeys.mine(), queryFn: reminderApi.listMine });
}

/** Rahbar: yangi eslatma/ogohlantirish yuborish. */
export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReminderCreate) => reminderApi.create(payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: reminderKeys.all });
      toast.success(vars.severity === "warning" ? "Ogohlantirish yuborildi ⚠️" : "Eslatma yuborildi 🔔");
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Yuborib bo'lmadi"),
  });
}

/** Rahbar: eslatmani o'chirish. */
export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reminderApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reminderKeys.all });
      toast.success("Eslatma o'chirildi");
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "O'chirib bo'lmadi"),
  });
}

/** Xodim: eslatmani o'qilgan deb belgilash. */
export function useMarkReminderRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reminderApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reminderKeys.mine() });
    },
  });
}
