import { MapPin, Loader2, ShieldAlert, Settings, RefreshCw, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/shared/ui/drawer";
import type { GeoErrorInfo } from "@/shared/lib/geoError";

interface GeoPermissionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** true bo'lsa — joylashuv olinmoqda (spinner ko'rsatiladi) */
  locating: boolean;
  /** Xato bo'lsa — error ma'lumoti; aks holda null (boshlang'ich "tushuntirish" ko'rinishi) */
  error: GeoErrorInfo | null;
  /** "Ruxsat berish" / "Qayta urinish" tugmasi bosilganda */
  onRequest: () => void;
}

/**
 * Pastdan chiquvchi joylashuv ruxsati paneli (bottom sheet).
 *
 * Uch holatda ishlaydi:
 *  1. error === null  → "Nega joylashuv kerak" tushuntirishi + "Ruxsat berish" tugmasi
 *  2. locating === true → spinner ("Aniqlanmoqda…")
 *  3. error !== null  → xato xabari; agar ruxsat rad etilgan bo'lsa, Settings qadamlari
 *
 * DIQQAT: brauzerning haqiqiy ruxsat oynasi stilllab bo'lmaydi. Bu sheet —
 * o'sha oynadan OLDIN chiqadigan o'z tushuntirishimiz va rad etilganda yo'l-yo'riq.
 */
export function GeoPermissionSheet({
  open,
  onOpenChange,
  locating,
  error,
  onRequest,
}: GeoPermissionSheetProps) {
  const isDenied = error?.kind === "denied";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* z-[71]: Scanner full-screen overlay (z-[60]) ustida ko'rinishi shart —
          aks holda GPS ruxsat paneli qora kamera fonida ko'rinmay qoladi. */}
      <DrawerContent className="max-w-md mx-auto z-[71]" overlayClassName="z-[70]">
        {/* Yopish tugmasi */}
        <button
          onClick={() => onOpenChange(false)}
          aria-label="Yopish"
          className="absolute right-4 top-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X size={16} />
        </button>

        <DrawerHeader className="items-center text-center pt-6">
          {/* Ikonka — holatga qarab rang o'zgaradi */}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 ${
              error
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            }`}
          >
            {locating ? (
              <Loader2 size={30} className="animate-spin" />
            ) : error ? (
              <ShieldAlert size={30} />
            ) : (
              <MapPin size={30} />
            )}
          </div>

          <DrawerTitle className="text-lg">
            {locating
              ? "Joylashuv aniqlanmoqda…"
              : error
                ? error.title
                : "Joylashuvga ruxsat bering"}
          </DrawerTitle>

          <DrawerDescription className="text-sm leading-relaxed px-2">
            {locating
              ? "Iltimos, biroz kuting va brauzer so'rasa «Ruxsat berish»ni tanlang."
              : error
                ? error.message
                : "Davomatni qayd etish uchun joylashuvingiz kerak. «Ruxsat berish» tugmasini bosing va brauzer so'rovida «Allow»ni tanlang."}
          </DrawerDescription>
        </DrawerHeader>

        {/* Rad etilganda — Settings'ga borish qadamlari */}
        {isDenied && error?.steps && (
          <div className="px-4 pb-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 mb-3 text-slate-700">
                <Settings size={15} className="text-slate-500" />
                <span className="text-sm font-semibold">Sozlamalardan yoqing:</span>
              </div>
              <ol className="space-y-2.5">
                {error.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        <DrawerFooter className="pb-8">
          <button
            onClick={onRequest}
            disabled={locating}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-red-700 text-white font-bold rounded-2xl hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
          >
            {locating ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Aniqlanmoqda…
              </>
            ) : error ? (
              <>
                <RefreshCw size={18} /> Qayta urinish
              </>
            ) : (
              <>
                <MapPin size={18} /> Ruxsat berish
              </>
            )}
          </button>
          <button
            onClick={() => onOpenChange(false)}
            disabled={locating}
            className="w-full py-3 text-slate-500 font-medium rounded-2xl hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Bekor qilish
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
