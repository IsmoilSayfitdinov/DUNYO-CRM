import { apiClient } from "@/shared/lib/api";
import type { User, AuthToken, SessionInfo, ChangePasswordDto } from "../types";

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: AuthToken;
}

export const authApi = {
  login: (dto: LoginDto) =>
    apiClient.post<LoginResponse>("/auth/login", dto).then((r) => r.data),

  /** Parolni o'zgartirish (joriy sessiyadan tashqari hammasi chiqariladi) */
  changePassword: (dto: ChangePasswordDto) =>
    apiClient.post("/auth/change-password", dto).then((r) => r.data),

  /** Faol seanslar ro'yxati */
  getSessions: () =>
    apiClient.get<SessionInfo[]>("/auth/sessions").then((r) => r.data),

  /** Seansni yakunlash (revoke) */
  revokeSession: (id: string) =>
    apiClient.delete(`/auth/sessions/${id}`).then((r) => r.data),
};
