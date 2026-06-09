import { useQuery } from "@tanstack/react-query";
import { attendanceApi } from "../api/attendance-api";
import { attendanceKeys } from "../api/query-keys";
import type { AttendanceQuery } from "../types";

/** Mening davomatim */
export function useMyAttendance(params?: AttendanceQuery) {
  return useQuery({
    queryKey: attendanceKeys.my(params),
    queryFn: () => attendanceApi.getMy(params),
  });
}

/** Mening haftalik davomatim (oy ichida) */
export function useMyWeeklyAttendance(year?: number, month?: number) {
  return useQuery({
    queryKey: attendanceKeys.myWeekly(year, month),
    queryFn: () => attendanceApi.getMyWeekly(year, month),
  });
}

/** Bugungi jamoa davomati */
export function useTeamAttendance(workDate?: string) {
  return useQuery({
    queryKey: attendanceKeys.team(workDate),
    queryFn: () => attendanceApi.getTeam(workDate),
  });
}

/** Bitta xodimning davomati */
export function useEmployeeAttendance(employeeId: string, params?: AttendanceQuery) {
  return useQuery({
    queryKey: attendanceKeys.byEmployee(employeeId, params),
    queryFn: () => attendanceApi.getByEmployee(employeeId, params),
    enabled: !!employeeId,
  });
}

/** Davomat trendi (analitika) */
export function useAttendanceTrends(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: attendanceKeys.trends(startDate, endDate),
    queryFn: () => attendanceApi.getTrends(startDate, endDate),
  });
}
