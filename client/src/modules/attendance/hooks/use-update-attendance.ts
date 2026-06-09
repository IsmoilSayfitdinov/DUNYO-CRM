import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { attendanceApi } from "../api/attendance-api";
import { attendanceKeys } from "../api/query-keys";
import type { UpdateAttendanceDto } from "../types";

/** Davomatni tahrirlash (PATCH /attendance/{id}) */
export function useUpdateAttendance(attendanceId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateAttendanceDto) => attendanceApi.update(attendanceId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success("Davomat yangilandi");
    },
    onError: () => toast.error("Yangilashda xatolik"),
  });
}
