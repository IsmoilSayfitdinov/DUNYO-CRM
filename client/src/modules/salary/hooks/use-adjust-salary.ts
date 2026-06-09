import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { salaryApi } from "../api/salary-api";
import { salaryKeys } from "../api/query-keys";

/** Ish haqiga premiya(+)/avans(-) qo'llash (PATCH /salary-history/{id}/adjust) */
export function useAdjustSalary() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ salaryId, bonus, note }: { salaryId: string; bonus: number; note?: string }) =>
      salaryApi.adjust(salaryId, bonus, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salaryKeys.all });
      toast.success("Saqlandi");
    },
    onError: () => toast.error("O'zgartirib bo'lmadi"),
  });
}
