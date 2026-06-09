import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { employeeApi } from "../api/employee-api";
import { employeeKeys } from "../api/query-keys";

/**
 * Xodimni faollashtirish / faolsizlantirish (PATCH /employees/{id} { is_active }).
 * O'chirish (DELETE) emas — qaytariladigan holat o'zgarishi.
 */
export function useSetEmployeeActive() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      employeeApi.update(id, { is_active: isActive }),
    onSuccess: (_data, { isActive }) => {
      qc.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success(isActive ? "Xodim faollashtirildi" : "Xodim faolsizlantirildi");
    },
    onError: () => toast.error("Holatni o'zgartirib bo'lmadi"),
  });
}
