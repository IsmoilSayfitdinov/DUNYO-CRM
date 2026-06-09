import type { AttendanceQuery } from "../types";

export const attendanceKeys = {
  all: ["attendance"] as const,
  my: (params?: AttendanceQuery) => [...attendanceKeys.all, "my", params ?? {}] as const,
  myWeekly: (year?: number, month?: number) => [...attendanceKeys.all, "my-weekly", year ?? null, month ?? null] as const,
  team: (workDate?: string) => [...attendanceKeys.all, "team", workDate ?? "today"] as const,
  byEmployee: (employeeId: string, params?: AttendanceQuery) =>
    [...attendanceKeys.all, "employee", employeeId, params ?? {}] as const,
  trends: (start?: string, end?: string) => [...attendanceKeys.all, "trends", start ?? "", end ?? ""] as const,
};
