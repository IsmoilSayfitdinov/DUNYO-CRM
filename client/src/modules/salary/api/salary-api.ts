import { apiClient } from "@/shared/lib/api";
import type { PageParams } from "@/shared/lib/api";
import type { SalaryHistory, SalarySummary, SalaryWithEmployeeInfo, SalaryListParams, SalaryTrendPoint, SalaryAdjustment, SalaryAdjustmentCreate, SalaryAdjustmentWithEmployee } from "../types";

export const salaryApi = {
  /** GET /salary-history/ — barcha xodimlar ish haqi (oy bo'yicha, xodim ma'lumoti bilan) */
  getAll: (params?: SalaryListParams) =>
    apiClient.get<SalaryWithEmployeeInfo[]>("/salary-history/", { params }).then((r) => r.data),

  /** GET /salary-history/trend — oylar bo'yicha umumiy ish haqi dinamikasi */
  getTrend: () =>
    apiClient.get<SalaryTrendPoint[]>("/salary-history/trend").then((r) => r.data),

  /** GET /salary-history/me — mening ish haqi tarixim (massiv) */
  getMy: (params?: PageParams) =>
    apiClient.get<SalaryHistory[]>("/salary-history/me", { params }).then((r) => r.data),

  /** GET /employees/{id}/salary-history — bitta xodimning ish haqi tarixi (massiv) */
  getByEmployee: (employeeId: string, params?: PageParams) =>
    apiClient.get<SalaryHistory[]>(`/employees/${employeeId}/salary-history`, { params }).then((r) => r.data),

  /** GET /salary-history/summary?year&month — oy bo'yicha umumiy hisobot */
  getSummary: (year: number, month: number) =>
    apiClient.get<SalarySummary>("/salary-history/summary", { params: { year, month } }).then((r) => r.data),

  /** POST /salary-history/{employeeId}/pay?salary_id=... — to'lash */
  pay: (employeeId: string, salaryId: string) =>
    apiClient
      .post<SalaryHistory>(`/salary-history/${employeeId}/pay`, null, { params: { salary_id: salaryId } })
      .then((r) => r.data),

  /** POST /salary-history/{employeeId}/calculate?year&month — hisoblash */
  calculate: (employeeId: string, year: number, month: number) =>
    apiClient
      .post<SalaryHistory>(`/salary-history/${employeeId}/calculate`, null, { params: { year, month } })
      .then((r) => r.data),

  /** PATCH /salary-history/{salaryId}/adjust — premiya(+)/avans(-) + izoh */
  adjust: (salaryId: string, bonus: number, note?: string) =>
    apiClient.patch<SalaryHistory>(`/salary-history/${salaryId}/adjust`, { bonus, note: note || null }).then((r) => r.data),

  /** POST /salary-history/adjustment — avans/premiya berish (oylik hisoblanmasa ham) */
  giveAdjustment: (payload: SalaryAdjustmentCreate) =>
    apiClient.post<SalaryAdjustment>("/salary-history/adjustment", payload).then((r) => r.data),

  /** GET /salary-history/adjustments?employee_id&year&month — xodimning oy bo'yicha avans/premiyalari */
  listAdjustments: (employeeId: string, year: number, month: number) =>
    apiClient
      .get<SalaryAdjustment[]>("/salary-history/adjustments", { params: { employee_id: employeeId, year, month } })
      .then((r) => r.data),

  /** GET /salary-history/adjustments/all?year&month — barcha xodimlarning shu oydagi avans/premiyalari */
  listTeamAdjustments: (year: number, month: number) =>
    apiClient
      .get<SalaryAdjustmentWithEmployee[]>("/salary-history/adjustments/all", { params: { year, month } })
      .then((r) => r.data),
};
