import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./token";

// API manzili: VITE_API_BASE_URL berilsa o'sha; aks holda NISBIY "/api/v1".
// Nisbiy bo'lgani uchun so'rovlar sahifa ochilgan ORIGIN'ga ketadi va vite proxy
// (yoki production'da reverse-proxy) ularni backendga uzatadi. Shu sababli:
//  - localhost, lokal IP (192.168.x), VA cloudflared tunnel — hammasida ishlaydi;
//  - CORS muammosi yo'q (bir origin); alohida 8000-portni ochish shart emas.
export const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// SINGLE-FLIGHT REFRESH: bir vaqtda faqat BITTA /auth/refresh chaqiriladi. Parallel
// 401'lar (reload yoki "qayta kirish"da hamma so'rov birdan refetch bo'lganda) shu
// bitta promise'ni kutadi. Aks holda har biri eski refresh token bilan refresh chaqirib,
// rotatsiya (token almashinuvi) tufayli bittasidan boshqasi bekor bo'lib -> logout bo'lardi.
let refreshPromise: Promise<string> | null = null;

export function refreshTokens(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.reject(new Error("Refresh token mavjud emas"));

  refreshPromise = axios
    .post<{ access_token: string; refresh_token: string }>(`${baseURL}/auth/refresh`, {
      refresh_token: refreshToken,
    })
    .then((res) => {
      setTokens(res.data.access_token, res.data.refresh_token);
      return res.data.access_token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        const newAccess = await refreshTokens(); // umumiy single-flight refresh
        original.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(original); // asl so'rovni qayta yuboramiz
      } catch {
        clearTokens();
        // token tiklanmadi — login sahifasiga qaytaramiz
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
