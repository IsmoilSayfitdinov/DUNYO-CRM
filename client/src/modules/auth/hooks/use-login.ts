import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { authApi, type LoginResponse } from "../api/auth-api";
import { useAuth } from "./auth-context";
import { setTokens } from "@/shared/lib/api";

export function useLogin() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user, token }: LoginResponse) => {
      setTokens(token.access_token, token.refresh_token);
      setUser(user);
      toast.success("Xush kelibsiz!");
      navigate(`/${user.role}`);
    },
    onError: (err: AxiosError<{ detail?: string }>) => {
      // Tarmoq/server xatosini noto'g'ri paroldan ajratamiz — aks holda har qanday
      // muammo "Login yoki parol noto'g'ri" bo'lib ko'rinadi (asl sabab yashirinadi).
      if (!err.response) {
        toast.error("Serverga ulanib bo'lmadi. Tarmoq yoki server holatini tekshiring.");
      } else if (err.response.status === 401) {
        toast.error("Login yoki parol noto'g'ri");
      } else if (err.response.status === 429) {
        toast.error("Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring.");
      } else {
        toast.error(err.response.data?.detail ?? "Xatolik yuz berdi");
      }
    },
  });
}
