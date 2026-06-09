import type { EmployeeListParams } from "../types";

export const employeeKeys = {
  all: ["employees"] as const,
  list: (params?: EmployeeListParams) => [...employeeKeys.all, "list", params ?? {}] as const,
  me: () => [...employeeKeys.all, "me"] as const,
  detail: (id: string) => [...employeeKeys.all, "detail", id] as const,
};
