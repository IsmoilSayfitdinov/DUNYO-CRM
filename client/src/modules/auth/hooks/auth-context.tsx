import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types";
import { getAccessToken, getRefreshToken, clearTokens } from "@/shared/lib/api";
import { sessionApi } from "../api/session-api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Reload'dan keyin access token xotirada yo'q bo'ladi; refresh token bo'lsa
      // avval uni yangilab, so'ng profilni yuklaymiz.
      if (!getAccessToken() && getRefreshToken()) {
        try {
          await sessionApi.refresh();
        } catch (e) {
          // Faqat refresh token HAQIQATAN yaroqsiz (401/403) bo'lsa tozalaymiz.
          // Tarmoq/server uzilishida (tunnel sekin, backend o'chgan) tokenni SAQLAYMIZ —
          // aks holda har "qayta kirishda" akkauntdan chiqib ketardi.
          const status = (e as { response?: { status?: number } })?.response?.status;
          if (status === 401 || status === 403) clearTokens();
          setIsLoading(false);
          return;
        }
      }

      if (!getAccessToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const me = await sessionApi.getMe();
        setUser(me);
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, []);

   const logout = async () => {
      console.log("🔴 LOGOUT BOSILDI");  
      try {
          await sessionApi.logout();
      } catch {
          // backend xato bersa ham, mahalliy tozalashni davom ettiramiz
      }
      clearTokens();   // ← bu HAR DOIM ishlaydi (try'dan tashqarida)
      setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
