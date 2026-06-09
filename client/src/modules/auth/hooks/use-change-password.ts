import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { authApi } from "../api/auth-api";
import type { ChangePasswordDto } from "../types";

/** Parolni o'zgartirish */
export function useChangePassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ChangePasswordDto) => authApi.changePassword(dto),
    onSuccess: () => {
      // Boshqa seanslar serverda chiqarildi — ro'yxatni yangilaymiz
      qc.invalidateQueries({ queryKey: ["auth", "sessions"] });
      toast.success("Parol o'zgartirildi");
    },
    onError: (err: AxiosError<{ detail?: string }>) => {
      if (err.response?.status === 400) {
        toast.error("Joriy parol noto'g'ri");
      } else {
        toast.error(err.response?.data?.detail ?? "Parolni o'zgartirib bo'lmadi");
      }
    },
  });
}
