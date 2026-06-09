import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw, AlertCircle } from "lucide-react";

export function Offline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      // Actual check happens via window events, but we can manually trigger if needed
      if (navigator.onLine) setIsOnline(true);
    }, 1500);
  };

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[32px] border border-slate-200 p-10 max-w-sm w-full text-center shadow-2xl overflow-hidden relative group">
        {/* Animated background pulse */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-destructive/5 rounded-full blur-3xl group-hover:bg-destructive/10 transition-colors duration-700" />
        
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-destructive/5">
            <WifiOff size={40} className="text-destructive animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Internet aloqasi mavjud emas</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
            Tizimdan foydalanish uchun internetga ulaning. Aloqa tiklanishi bilan sahifa avtomatik ravishda yangilanadi.
          </p>
          
          <div className="bg-slate-50 rounded-2xl p-4 mb-8 flex items-start gap-3 text-left border border-slate-100">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              Kutilmagan uzilishlar yuz bersa, routeringizni yoki tarmoq sozlamalarini tekshirib ko'ring.
            </p>
          </div>
          
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground text-sm font-black rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/25 disabled:opacity-70 group active:scale-[0.98]"
          >
            <RefreshCw size={18} className={isRetrying ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
            {isRetrying ? "Tekshirilmoqda..." : "Yana urinib ko'rish"}
          </button>
        </div>
      </div>
    </div>
  );
}
