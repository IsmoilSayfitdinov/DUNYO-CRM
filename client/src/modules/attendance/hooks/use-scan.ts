import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { attendanceApi } from "../api/attendance-api";
import { attendanceKeys } from "../api/query-keys";
import { celebrate } from "@/shared/lib/confetti";
import type { ScanDto } from "../types";

/** QR/skan orqali davomat belgilash (POST /attendance/scan) */
export function useScan() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: ScanDto) => attendanceApi.scan(dto),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
      // check_out null bo'lsa — bu yangi check-in (ishga keldi): bayram qilamiz.
      const isCheckIn = !res?.check_out;
      if (isCheckIn) {
        celebrate();
        toast.success("Xush kelibsiz! Ishga kelganingiz belgilandi 🎉");
      } else {
        toast.success("Ish kuni yakunlandi. Yaxshi dam oling!");
      }
    },
    onError: (err: AxiosError<{ detail?: string }>) => {
      // Backend sababini ko'rsatamiz (masalan "Siz magazinda emassiz",
      // "Siz allaqachon check-in qilgansiz", "Bu QR boshqa filialniki").
      toast.error(err.response?.data?.detail ?? "Skanerda xatolik");
    },
  });
}
