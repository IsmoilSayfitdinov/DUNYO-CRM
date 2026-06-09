import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { taskApi } from "../api/task-api";
import { taskKeys } from "../api/query-keys";
import type { TaskCreate, TaskStatus } from "../types";

/** Rahbar: o'zi yaratgan barcha vazifalar (xodim ismi bilan). */
export function useTeamTasks() {
  return useQuery({ queryKey: taskKeys.team(), queryFn: taskApi.listTeam });
}

/** Xodim: o'ziga biriktirilgan vazifalar. */
export function useMyTasks() {
  return useQuery({ queryKey: taskKeys.mine(), queryFn: taskApi.listMine });
}

/** Rahbar: yangi vazifa yaratish. */
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaskCreate) => taskApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Vazifa yaratildi 📋");
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Saqlab bo'lmadi"),
  });
}

/** Rahbar: vazifani o'chirish. */
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Vazifa o'chirildi");
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "O'chirib bo'lmadi"),
  });
}

/** Xodim: vazifa holatini o'zgartirish. */
export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => taskApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.mine() });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "O'zgartirib bo'lmadi"),
  });
}
