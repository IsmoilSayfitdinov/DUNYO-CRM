const LEGACY_ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

// XAVFSIZLIK: access token faqat XOTIRADA saqlanadi (localStorage'da emas) — shu
// sababli XSS orqali o'g'irlanishi ancha qiyinroq. Refresh token esa reload'dan
// keyin sessiyani tiklash uchun localStorage'da qoladi (httpOnly cookie'siz
// muqobil yo'q; to'liq himoya uchun keyinchalik server-side cookie tavsiya etiladi).
let accessToken: string | null = null;

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setAccessToken = (newAccess: string) => {
  accessToken = newAccess;
};

export const setTokens = (newAccess: string, newRefresh: string) => {
  accessToken = newAccess;
  localStorage.setItem(REFRESH_KEY, newRefresh);
  // Eskirgan localStorage access_token'ni tozalaymiz (avvalgi versiyalardan qolgan).
  localStorage.removeItem(LEGACY_ACCESS_KEY);
};

export const clearTokens = () => {
  accessToken = null;
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(LEGACY_ACCESS_KEY);
};
