import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { salaryApi } from "../api/salary-api";
import { salaryKeys } from "../api/query-keys";
import type { SalaryAdjustmentCreate } from "../types";

/** Bitta xodimning oy bo'yicha avans/premiya ro'yxati (itemized). */
export function useAdjustments(employeeId: string | undefined, year: number, month: number) {
  return useQuery({
    queryKey: salaryKeys.adjustments(employeeId ?? "", year, month),
    queryFn: () => salaryApi.listAdjustments(employeeId as string, year, month),
    enabled: !!employeeId,
  });
}

/** Barcha xodimlarning shu oydagi avans/premiyalari (sahifada ko'rinadi). */
export function useTeamAdjustments(year: number, month: number) {
  return useQuery({
    queryKey: salaryKeys.teamAdjustments(year, month),
    queryFn: () => salaryApi.listTeamAdjustments(year, month),
  });
}

/** Avans/premiya berish (oylik hisoblanmasa ham). */
export function useGiveAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SalaryAdjustmentCreate) => salaryApi.giveAdjustment(payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: salaryKeys.all });
      qc.invalidateQueries({ queryKey: salaryKeys.adjustments(vars.employee_id, vars.year, vars.month) });
      qc.invalidateQueries({ queryKey: salaryKeys.teamAdjustments(vars.year, vars.month) });
      toast.success(vars.type === "bonus" ? "Premiya berildi 🎁" : "Avans berildi");
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Saqlab bo'lmadi"),
  });
}
