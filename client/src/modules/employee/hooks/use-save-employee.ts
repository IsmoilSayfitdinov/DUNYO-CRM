import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { employeeApi } from "../api/employee-api";
import { employeeKeys } from "../api/query-keys";
import type { CreateEmployeeDto } from "../types";
import { useAuth } from "@/modules/auth";
import type { EmployeeFormValues } from "../types/form";

/**
 * Xodim qo'shish yoki tahrirlash.
 * `employeeId` berilsa — update (PATCH), aks holda — create (POST).
 * `leader_user_id` joriy (login qilgan) leader'dan avtomatik olinadi.
 */
export function useSaveEmployee(employeeId?: string) {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (values: EmployeeFormValues) => {
      if (employeeId) {
        // Update — UpdateEmployeeDto'da password yo'q, shuning uchun olib tashlaymiz
        const { password: _password, ...rest } = values;
        return employeeApi.update(employeeId, rest);
      }
      // Create — leader_user_id session'dan
      const dto: CreateEmployeeDto = {
        ...values,
        password: values.password ?? "",
        leader_user_id: user?.id ?? "",
      };
      return employeeApi.create(dto);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success("Xodim saqlandi");
    },
    onError: () => toast.error("Saqlashda xatolik (maydonlarni tekshiring)"),
  });
}
