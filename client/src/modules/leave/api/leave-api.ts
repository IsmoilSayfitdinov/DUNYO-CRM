import { apiClient } from "@/shared/lib/api";
import type { LeaveRequest, LeaveRequestCreateDto } from "../types";

export const leaveApi = {
  /** POST /leave-requests/ — yangi ta'til so'rovi (xodim) */
  create: (dto: LeaveRequestCreateDto) =>
    apiClient.post<LeaveRequest>("/leave-requests/", dto).then((r) => r.data),

  /** GET /leave-requests/me — mening so'rovlarim */
  getMy: () => apiClient.get<LeaveRequest[]>("/leave-requests/me").then((r) => r.data),

  /** GET /leave-requests/ — jamoa so'rovlari (rahbar) */
  getForLeader: () => apiClient.get<LeaveRequest[]>("/leave-requests/").then((r) => r.data),

  /** PATCH /leave-requests/{id}/approve — tasdiqlash */
  approve: (id: string) =>
    apiClient.patch<LeaveRequest>(`/leave-requests/${id}/approve`).then((r) => r.data),

  /** PATCH /leave-requests/{id}/reject — rad etish (sabab bilan) */
  reject: (id: string, reason: string) =>
    apiClient.patch<LeaveRequest>(`/leave-requests/${id}/reject`, { reason }).then((r) => r.data),
};
