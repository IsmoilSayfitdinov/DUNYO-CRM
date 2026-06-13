import React, { useState } from "react";
import { useLogin } from "../hooks/use-login";
import {
  Building2, User, Lock, Eye, EyeOff, ArrowRight,
  AlertCircle, Loader2, Shield, Users, BarChart3, Clock, CheckCircle2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  username: z.string().min(3, "Foydalanuvchi nomi kamida 3 ta belgi"),
  password: z.string().min(1, "Parolni kiriting"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const features = [
  { icon: Users, label: "Xodimlar va davomat boshqaruvi" },
  { icon: BarChart3, label: "Analitika va ish haqi hisoboti" },
  { icon: Clock, label: "QR orqali kelish-ketish qaydi" },
  { icon: Shield, label: "Xavfsiz va ishonchli tizim" },
];

const EASE = "cubic-bezier(.22,.68,.16,1)";
const rise = (delay: number) => ({ animation: `riseIn 0.7s ${EASE} both`, animationDelay: `${delay}s` });

// Form fonidagi suzuvchi "shariklar"
const bubbles = [
  { size: 70, left: "10%", top: "16%", delay: 0,   dur: 10, op: 0.55 },
  { size: 42, left: "80%", top: "22%", delay: 1.4, dur: 12, op: 0.5 },
  { size: 96, left: "66%", top: "68%", delay: 0.7, dur: 14, op: 0.4 },
  { size: 30, left: "28%", top: "60%", delay: 2.1, dur: 9,  op: 0.55 },
  { size: 54, left: "86%", top: "55%", delay: 0.4, dur: 11, op: 0.45 },
  { size: 38, left: "18%", top: "84%", delay: 1.0, dur: 13, op: 0.5 },
  { size: 24, left: "46%", top: "12%", delay: 1.8, dur: 8,  op: 0.6 },
];

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending, error: loginError } = useLogin();

  const error = loginError ? "Foydalanuvchi nomi yoki parol noto'g'ri kiritildi." : "";

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => login(data);

  return (
    <div className="min-h-screen flex font-[Inter,sans-serif] bg-white">
      {/* ===== Left Panel ===== */}
      <div
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-10 xl:p-14"
        style={{ background: "linear-gradient(140deg, #ef4444 0%, #dc2626 45%, #991b1b 100%)" }}
      >
        {/* Grid pattern + orbs */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
        <div className="absolute w-[480px] h-[480px] rounded-full -top-24 -left-24" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)", filter: "blur(40px)", animation: "floatA 10s ease-in-out infinite" }} />
        <div className="absolute w-[380px] h-[380px] rounded-full bottom-0 -right-10" style={{ background: "radial-gradient(circle, rgba(0,0,0,0.18), transparent 70%)", filter: "blur(50px)", animation: "floatA 13s ease-in-out infinite reverse" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3" style={rise(0)}>
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Building2 size={24} className="text-white" />
          </div>
          <div className="text-2xl font-extrabold tracking-tight">
            <span className="text-white">DUNYO</span>
            <span className="text-white/50 ml-1">CRM</span>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <h2 className="text-4xl xl:text-[54px] font-extrabold text-white leading-[1.08] tracking-tight mb-5">
            <span className="block" style={rise(0.12)}>Biznesingizni</span>
            <span className="block" style={rise(0.24)}>samarali</span>
            <span
              className="block bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, #ffffff, #fecaca, #ffffff)",
                backgroundSize: "200% auto",
                animation: `riseIn 0.7s ${EASE} 0.36s both, shimmer 3.5s linear 1.2s infinite`,
              }}
            >
              boshqaring
            </span>
          </h2>
          <p className="text-white/70 text-[17px] leading-relaxed max-w-[400px] mb-8" style={rise(0.5)}>
            Barcha jarayonlarni bir joydan nazorat qiling — tez, qulay va ishonchli.
          </p>

          {/* Glass feature card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 max-w-md shadow-2xl" style={rise(0.62)}>
            <div className="space-y-3.5">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex items-center gap-3.5" style={{ animation: `fadeSlideUp 0.5s ease-out ${0.75 + i * 0.1}s both` }}>
                    <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/10 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-white" />
                    </div>
                    <span className="text-white/90 text-sm font-medium">{f.label}</span>
                    <CheckCircle2 size={16} className="text-white/40 ml-auto" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/50 text-[13px] font-medium" style={rise(0.7)}>
          © 2026 DUNYO CRM · Barcha huquqlar himoyalangan
        </div>
      </div>

      {/* ===== Right Panel — form ===== */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden bg-gradient-to-br from-rose-50 via-slate-50 to-red-50">
        {/* Harakatlanuvchi gradient porlash */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(120deg, rgba(254,226,226,0.55), rgba(255,255,255,0) 45%, rgba(254,202,202,0.45))",
            backgroundSize: "200% 200%",
            animation: "gradientShift 16s ease infinite",
          }}
        />

        {/* Yumshoq ambient orblar */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(220,38,38,0.16), transparent 70%)", animation: "floatA 12s ease-in-out infinite" }} />
        <div className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(251,113,133,0.18), transparent 70%)", animation: "floatA 15s ease-in-out infinite reverse" }} />
        <div className="absolute top-1/3 left-1/3 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(252,165,165,0.18), transparent 70%)", animation: "floatB 18s ease-in-out infinite" }} />

        {/* Suzuvchi shariklar */}
        {bubbles.map((b, i) => (
          <span
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: b.size,
              height: b.size,
              left: b.left,
              top: b.top,
              opacity: b.op,
              background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95), rgba(254,202,202,0.55) 48%, rgba(220,38,38,0.16) 100%)",
              boxShadow: "inset 0 1px 6px rgba(255,255,255,0.8), 0 6px 20px rgba(220,38,38,0.10)",
              border: "1px solid rgba(255,255,255,0.5)",
              animation: `bubbleFloat ${b.dur}s ease-in-out ${b.delay}s infinite`,
            }}
          />
        ))}

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6" style={rise(0)}>
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-red-200">
                <Building2 size={20} className="text-white" />
              </div>
              <div className="text-lg font-extrabold tracking-tight">
                <span className="text-slate-900">DUNYO</span>
                <span className="text-primary ml-1">CRM</span>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-300/30 p-6 sm:p-8" style={{ animation: `cardIn 0.75s ${EASE} both`, animationDelay: "0.1s" }}>
            {/* Header with icon badge */}
            <div className="flex flex-col items-center text-center mb-7">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-red-200 mb-4" style={{ animation: `popIn 0.6s ${EASE} both`, animationDelay: "0.3s" }}>
                <Lock size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={rise(0.35)}>Xush kelibsiz!</h1>
              <p className="text-slate-400 text-sm mt-1" style={rise(0.42)}>Davom etish uchun hisobingizga kiring</p>
            </div>

            {/* Error */}
            {(error || errors.username || errors.password) && (
              <div className="mb-5 rounded-xl p-3.5 flex items-start gap-3 bg-destructive/5 border border-destructive/20 animate-in fade-in slide-in-from-top-1 duration-300">
                <AlertCircle size={17} className="text-destructive shrink-0 mt-0.5" />
                <div className="text-[13px] text-destructive font-medium space-y-0.5">
                  {error && <p>{error}</p>}
                  {errors.username && <p>{errors.username.message}</p>}
                  {errors.password && <p>{errors.password.message}</p>}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5" style={rise(0.48)}>
                <label htmlFor="login-username" className="text-[13px] font-semibold text-slate-500 block ml-0.5">Foydalanuvchi nomi</label>
                <div className="group relative rounded-xl border-2 border-slate-100 bg-slate-50/70 focus-within:border-primary focus-within:bg-white focus-within:shadow-sm transition-all duration-200">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    {...register("username")}
                    id="login-username"
                    type="text"
                    autoComplete="username"
                    placeholder="Masalan: ismoil"
                    className="w-full pl-11 pr-4 py-3.5 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none text-[15px] rounded-xl"
                    style={{ caretColor: "#dc2626" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5" style={rise(0.56)}>
                <label htmlFor="login-password" className="text-[13px] font-semibold text-slate-500 block ml-0.5">Parol</label>
                <div className="group relative rounded-xl border-2 border-slate-100 bg-slate-50/70 focus-within:border-primary focus-within:bg-white focus-within:shadow-sm transition-all duration-200">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    {...register("password")}
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Parolni kiriting"
                    className="w-full pl-11 pr-12 py-3.5 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none text-[15px] rounded-xl"
                    style={{ caretColor: "#dc2626" }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 rounded-lg text-slate-400 hover:text-slate-500 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none w-fit" style={rise(0.64)}>
                <input type="checkbox" className="w-[18px] h-[18px] rounded border-slate-300 cursor-pointer" style={{ accentColor: "#dc2626" }} />
                <span className="text-[13px] text-slate-400">Meni eslab qol</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                style={rise(0.72)}
                className="w-full group h-[52px] rounded-xl bg-primary text-white font-semibold text-[15px] transition-all duration-200 hover:bg-red-500 hover:shadow-lg hover:shadow-red-200 active:scale-[0.98] disabled:opacity-60 disabled:hover:bg-primary mt-2 relative overflow-hidden shadow-md shadow-red-200/60"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className="relative flex items-center justify-center gap-2">
                  {isPending ? (
                    <><Loader2 size={19} className="animate-spin" /> Kirilmoqda…</>
                  ) : (
                    <>Kirish <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </div>
              </button>
            </form>
          </div>

          {/* Footer below card */}
          <p className="text-center text-[13px] text-slate-400 mt-6" style={rise(0.8)}>
            Hisobingiz yo'qmi? <span className="text-primary font-semibold">Administrator bilan bog'laning</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes floatA { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-26px) scale(1.05); } }
        @keyframes floatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(24px,-30px) scale(1.08); } }
        @keyframes bubbleFloat { 0% { transform: translateY(0) translateX(0) scale(1); } 50% { transform: translateY(-34px) translateX(12px) scale(1.06); } 100% { transform: translateY(0) translateX(0) scale(1); } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes riseIn { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cardIn { from { opacity: 0; transform: translateY(22px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(.5) rotate(-8deg); } 60% { transform: scale(1.08) rotate(3deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
        @keyframes shimmer { to { background-position: 200% center; } }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
