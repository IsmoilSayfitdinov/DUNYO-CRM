import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { employeeApi } from "../api/employee-api";
import { employeeKeys } from "../api/query-keys";
import type { UpdateMyProfileDto } from "../types";
import { useAuth } from "@/modules/auth";

/**
 * Xodim O'ZINING profilini tahrirlaydi (PATCH /employees/me).
 * Muvaffaqiyatda:
 *  - employees/me querysini yangilaymiz (Profil sahifasi yangilanadi),
 *  - auth context'dagi `user`ni ham yangilaymiz (header/avatar darhol o'zgaradi).
 */
export function useUpdateMyProfile() {
  const qc = useQueryClient();
  const { user, setUser } = useAuth();

  return useMutation({
    mutationFn: (dto: UpdateMyProfileDto) => employeeApi.updateMe(dto),
    onSuccess: (updated) => {
      // 1) Profil sahifasini yangi ma'lumot bilan yangilash
      qc.invalidateQueries({ queryKey: employeeKeys.me() });
      // 2) Global auth user'ni yangilash — updated.user backend qaytargan yangi User
      if (user) setUser({ ...user, ...updated.user });
      toast.success("Profil yangilandi");
    },
    onError: (err: AxiosError<{ detail?: string }>) => {
      if (err.response?.status === 409) {
        toast.error("Bu foydalanuvchi nomi allaqachon band");
      } else if (err.response?.status === 422) {
        toast.error("Maydonlarni tekshiring (telefon +998 bilan 13 ta belgi)");
      } else {
        toast.error(err.response?.data?.detail ?? "Profilni yangilab bo'lmadi");
      }
    },
  });
}
