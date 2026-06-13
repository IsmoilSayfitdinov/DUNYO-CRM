import { apiClient, refreshTokens } from "@/shared/lib/api";
import type { User } from "../types";

export const sessionApi = {
  getMe: () => apiClient.get<User>("/auth/me").then((r) => r.data),

  logout: () => apiClient.delete("/auth/logout"),
  // Reload'dan keyin access token xotirada yo'q bo'ladi — umumiy single-flight
  // refresh orqali yangi access olamiz (interceptor bilan bir xil manba -> poyga yo'q).
  refresh: (): Promise<string> => refreshTokens(),
};
