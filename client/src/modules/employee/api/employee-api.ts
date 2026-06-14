import { apiClient } from "@/shared/lib/api";
import type { Paginated } from "@/shared/lib/api";
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto, UpdateMyProfileDto, EmployeeListParams } from "../types";

export const employeeApi = {
  /** GET /employees/ — barcha xodimlar (sahifalangan, filial filtri bilan) */
  getAll: (params?: EmployeeListParams) =>
    apiClient.get<Paginated<Employee>>("/employees/", { params }).then((r) => r.data),

  /** GET /employees/me — mening xodim profilim */
  getMe: () => apiClient.get<Employee>("/employees/me").then((r) => r.data),

  /** PATCH /employees/me — o'z profilimni tahrirlash (ism/familiya/username/telefon) */
  updateMe: (dto: UpdateMyProfileDto) =>
    apiClient.patch<Employee>("/employees/me", dto).then((r) => r.data),

  /** GET /employees/{id} */
  getById: (id: string) =>
    apiClient.get<Employee>(`/employees/${id}`).then((r) => r.data),

  /** POST /employees/ — yangi xodim */
  create: (dto: CreateEmployeeDto) =>
    apiClient.post<Employee>("/employees/", dto).then((r) => r.data),

  /** PATCH /employees/{id} */
  update: (id: string, dto: UpdateEmployeeDto) =>
    apiClient.patch<Employee>(`/employees/${id}`, dto).then((r) => r.data),

  /** DELETE /employees/{id} */
  remove: (id: string) =>
    apiClient.delete<void>(`/employees/${id}`).then((r) => r.data),
};
