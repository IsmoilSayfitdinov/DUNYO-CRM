import { apiClient } from "@/shared/lib/api";
import type { Paginated } from "@/shared/lib/api";
import type { Attendance, ScanDto, UpdateAttendanceDto, AttendanceQuery, AttendanceTrendPoint, AttendanceWeekly, AttendanceReportRow } from "../types";

export const attendanceApi = {
  /** GET /attendance/me — mening davomatim (sahifalangan) */
  getMy: (params?: AttendanceQuery) =>
    apiClient.get<Paginated<Attendance>>("/attendance/me", { params }).then((r) => r.data),

  /** GET /attendance/me/weekly?year&month — oy ichidagi haftalik yig'indi */
  getMyWeekly: (year?: number, month?: number) =>
    apiClient.get<AttendanceWeekly[]>("/attendance/me/weekly", { params: { year, month } }).then((r) => r.data),

  /** GET /attendance/team — bugungi jamoa davomati */
  getTeam: (workDate?: string) =>
    apiClient
      .get<Attendance[]>("/attendance/team", { params: { work_date: workDate } })
      .then((r) => r.data),

  /** GET /employees/{id}/attendance — bitta xodimning davomati */
  getByEmployee: (employeeId: string, params?: AttendanceQuery) =>
    apiClient
      .get<Paginated<Attendance>>(`/employees/${employeeId}/attendance`, { params })
      .then((r) => r.data),

  /** POST /attendance/scan — QR/skan orqali davomat belgilash (branch_id + GPS shart) */
  scan: (dto: ScanDto) =>
    apiClient.post<Attendance>("/attendance/scan", dto).then((r) => r.data),

  /** PATCH /attendance/{id} — davomatni tahrirlash */
  update: (id: string, dto: UpdateAttendanceDto) =>
    apiClient.patch<Attendance>(`/attendance/${id}`, dto).then((r) => r.data),

  /** GET /attendance/analytics/trends?start_date&end_date — kunlik trend */
  getTrends: (startDate?: string, endDate?: string) =>
    apiClient
      .get<AttendanceTrendPoint[]>("/attendance/analytics/trends", { params: { start_date: startDate, end_date: endDate } })
      .then((r) => r.data),

  /** GET /attendance/report?year&month — oylik davomat hisoboti (har xodim) */
  report: (year: number, month: number) =>
    apiClient.get<AttendanceReportRow[]>("/attendance/report", { params: { year, month } }).then((r) => r.data),
};
