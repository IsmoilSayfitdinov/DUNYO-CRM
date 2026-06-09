import type { PageParams } from "@/shared/lib/api";

export const salaryKeys = {
  all: ["salary-history"] as const,
  list: (year?: number, month?: number, params?: PageParams) =>
    [...salaryKeys.all, "list", year ?? null, month ?? null, params ?? {}] as const,
  my: (params?: PageParams) => [...salaryKeys.all, "my", params ?? {}] as const,
  byEmployee: (employeeId: string, params?: PageParams) =>
    [...salaryKeys.all, "employee", employeeId, params ?? {}] as const,
  summary: (year: number, month: number) => [...salaryKeys.all, "summary", year, month] as const,
  trend: () => [...salaryKeys.all, "trend"] as const,
  adjustments: (employeeId: string, year: number, month: number) =>
    [...salaryKeys.all, "adjustments", employeeId, year, month] as const,
  teamAdjustments: (year: number, month: number) =>
    [...salaryKeys.all, "team-adjustments", year, month] as const,
};

