import React from "react";
import { useNavigate } from "react-router";
import { Building2, ArrowLeft, Home } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
          <Building2 size={28} className="text-slate-900" />
        </div>
        <div className="text-8xl font-black text-slate-700 mb-2 tracking-tighter select-none">404</div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Sahifa topilmadi</h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium">
          Siz qidirayotgan sahifa mavjud emas yoki sizda uni ko'rish uchun ruxsat yo'q.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
          >
            <ArrowLeft size={16} /> Ortga qaytish
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            <Home size={16} /> Bosh sahifa
          </button>
        </div>
      </div>
    </div>
  );
}
