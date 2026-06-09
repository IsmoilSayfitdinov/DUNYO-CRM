import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { salaryApi } from "../api/salary-api";
import { salaryKeys } from "../api/query-keys";

/** Ish haqini hisoblash (POST /salary-history/{employeeId}/calculate) */
export function useCalculateSalary() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, year, month }: { employeeId: string; year: number; month: number }) =>
      salaryApi.calculate(employeeId, year, month),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salaryKeys.all });
      toast.success("Ish haqi hisoblandi");
    },
    onError: () => toast.error("Hisoblashda xatolik"),
  });
}
