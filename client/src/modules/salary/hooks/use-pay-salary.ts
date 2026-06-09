import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { salaryApi } from "../api/salary-api";
import { salaryKeys } from "../api/query-keys";

/** Ish haqini to'langan deb belgilash (POST /salary-history/{employeeId}/pay) */
export function usePaySalary() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, salaryId }: { employeeId: string; salaryId: string }) =>
      salaryApi.pay(employeeId, salaryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salaryKeys.all });
      toast.success("Ish haqi to'landi");
    },
    onError: () => toast.error("To'lovda xatolik"),
  });
}
