import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, Download, X, CheckCircle2 } from "lucide-react";

export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl) {
      console.log("[PWA] Service worker registered:", swUrl);
    },
    onRegisterError(err) {
      console.error("[PWA] SW registration error:", err);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed right-4 left-4 sm:left-auto sm:max-w-sm z-[9998] bottom-[calc(var(--bottomnav-h)+env(safe-area-inset-bottom,0px)+0.75rem)] lg:bottom-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            needRefresh ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
          }`}
        >
          {needRefresh ? <Download size={18} /> : <CheckCircle2 size={18} />}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-900">
            {needRefresh ? "Yangi versiya tayyor" : "Ilova internetsiz ishlashga tayyor"}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {needRefresh
              ? "Eng so'nggi yangilanishlarni olish uchun qayta yuklang."
              : "Endi siz internetsiz ham asosiy sahifalarni ko'rishingiz mumkin."}
          </p>

          {needRefresh && (
            <button
              onClick={() => updateServiceWorker(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={12} /> Yangilash
            </button>
          )}
        </div>

        <button
          onClick={close}
          className="w-9 h-9 -m-2 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Yopish"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
