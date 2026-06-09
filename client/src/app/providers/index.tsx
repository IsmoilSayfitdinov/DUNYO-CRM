import type { ReactNode } from "react";
import { AuthProvider } from "@/modules/auth";

/**
 * Ilova darajasidagi barcha provayderlar shu yerda kompozitsiya qilinadi.
 * Yangi global kontekst qo'shilganda (theme, query-client, i18n...) shu yerga qo'shing.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
