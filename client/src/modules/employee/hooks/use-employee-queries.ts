import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { employeeApi } from "../api/employee-api";
import { employeeKeys } from "../api/query-keys";
import type { EmployeeListParams } from "../types";

// 404 (xodim topilmadi) — qayta urinish mantiqsiz: darhol xato holatiga o'tamiz,
// aks holda sahifa "Yuklanmoqda…"da 3 marta retry bo'lguncha qotib turadi.
const retryExcept404 = (count: number, err: unknown) => {
  if ((err as AxiosError)?.response?.status === 404) return false;
  return count < 2;
};

/** Barcha xodimlar ro'yxati (filial bo'yicha filter bilan) */
export function useEmployees(params?: EmployeeListParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeApi.getAll(params),
  });
}

/** Mening xodim profilim */
export function useMyEmployee() {
  return useQuery({ queryKey: employeeKeys.me(), queryFn: employeeApi.getMe });
}

/** Bitta xodim (id bo'yicha) */
export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeApi.getById(id),
    enabled: !!id,
    retry: retryExcept404,
  });
}
