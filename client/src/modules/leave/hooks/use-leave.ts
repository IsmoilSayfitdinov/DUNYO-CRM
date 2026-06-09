import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { leaveApi } from "../api/leave-api";
import { leaveKeys } from "../api/query-keys";
import type { LeaveRequestCreateDto } from "../types";

/** Mening ta'til so'rovlarim (xodim) */
export function useMyLeaveRequests() {
  return useQuery({ queryKey: leaveKeys.me(), queryFn: leaveApi.getMy });
}

/** Jamoa ta'til so'rovlari (rahbar). enabled=false bo'lsa so'rov yuborilmaydi. */
export function useLeaveRequests(enabled = true) {
  return useQuery({ queryKey: leaveKeys.team(), queryFn: leaveApi.getForLeader, enabled });
}

/** Yangi so'rov yuborish */
export function useCreateLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: LeaveRequestCreateDto) => leaveApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaveKeys.me() });
      toast.success("So'rov yuborildi");
    },
    onError: (err: AxiosError<{ detail?: string }>) =>
      toast.error(err.response?.data?.detail ?? "So'rovni yuborib bo'lmadi"),
  });
}

/** Tasdiqlash (rahbar) */
export function useApproveLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveApi.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaveKeys.team() });
      toast.success("So'rov tasdiqlandi");
    },
    onError: () => toast.error("Tasdiqlab bo'lmadi"),
  });
}

/** Rad etish (rahbar, sabab bilan) */
export function useRejectLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => leaveApi.reject(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaveKeys.team() });
      toast.success("So'rov rad etildi");
    },
    onError: () => toast.error("Rad etib bo'lmadi"),
  });
}
