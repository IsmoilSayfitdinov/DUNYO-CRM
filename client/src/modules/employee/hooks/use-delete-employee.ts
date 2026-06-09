import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { employeeApi } from "../api/employee-api";
import { employeeKeys } from "../api/query-keys";

export function useDeleteEmployee() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success("Xodim faolsizlandi !");
    },
    onError: () => toast.error("O'chirishda xatolik"),
  });
}
