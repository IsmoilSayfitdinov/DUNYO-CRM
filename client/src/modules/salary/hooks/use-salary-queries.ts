import { useQuery } from "@tanstack/react-query";
import type { PageParams } from "@/shared/lib/api";
import { salaryApi } from "../api/salary-api";
import { salaryKeys } from "../api/query-keys";

/** Barcha xodimlar ish haqi (oy bo'yicha, xodim ma'lumoti bilan) */
export function useAllSalaries(year?: number, month?: number, params?: PageParams) {
  return useQuery({
    queryKey: salaryKeys.list(year, month, params),
    queryFn: () => salaryApi.getAll({ year, month, ...params }),
  });
}

/** Oylar bo'yicha umumiy ish haqi dinamikasi (trend) */
export function useSalaryTrend() {
  return useQuery({
    queryKey: salaryKeys.trend(),
    queryFn: () => salaryApi.getTrend(),
  });
}

/** Mening ish haqi tarixim (massiv) */
export function useMySalary(params?: PageParams) {
  return useQuery({
    queryKey: salaryKeys.my(params),
    queryFn: () => salaryApi.getMy(params),
  });
}

/** Bitta xodimning ish haqi tarixi (massiv) */
export function useEmployeeSalary(employeeId: string, params?: PageParams) {
  return useQuery({
    queryKey: salaryKeys.byEmployee(employeeId, params),
    queryFn: () => salaryApi.getByEmployee(employeeId, params),
    enabled: !!employeeId,
  });
}

/** Oy bo'yicha umumiy hisobot */
export function useSalarySummary(year: number, month: number) {
  return useQuery({
    queryKey: salaryKeys.summary(year, month),
    queryFn: () => salaryApi.getSummary(year, month),
  });
}
