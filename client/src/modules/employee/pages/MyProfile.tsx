import React from "react";
import { ScoreRing } from "@/shared/ui/ScoreRing";
import { Phone, Calendar, Clock, Lock, DollarSign, Check, User } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useMyEmployee } from "@/modules/employee";


export function MyProfile() {
  const { data: emp, isLoading, isError } = useMyEmployee();

  if (isLoading) {
    return <EmptyState variant="loading" title="Yuklanmoqda…" description="Profil ma'lumotlaringiz olinmoqda" />;
  }
  if (isError || !emp) {
    return <EmptyState variant="error" title="Yuklab bo'lmadi" description="Profilni yuklab bo'lmadi." />;
  }

  const fullName = `${emp.user.first_name} ${emp.user.last_name}`.trim() || emp.user.username;
  const initials = fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const shift = `${(emp.shift_start || "").slice(0, 5)}–${(emp.shift_end || "").slice(0, 5)}`;
  const joinDate = (emp.created_at || "").slice(0, 10);

  const pills = [
    { icon: Phone, label: "Telefon", value: emp.user.phone || "—", color: "var(--primary)" },
    { icon: Clock, label: "Smena", value: shift || "—", color: "var(--warning)" },
    { icon: DollarSign, label: "Soatlik stavka", value: `${Number(emp.hourly_rate).toLocaleString()} so'm`, color: "var(--success)" },
    { icon: Calendar, label: "Qo'shilgan", value: joinDate || "—", color: "#6366f1" },
  ];

  const details = [
    { label: "Ism", value: emp.user.first_name },
    { label: "Familiya", value: emp.user.last_name },
    { label: "Username", value: `@${emp.user.username}` },
    { label: "Lavozim", value: emp.position },
    { label: "Telefon", value: emp.user.phone },
    { label: "Smena", value: shift },
    { label: "Smena raqami", value: String(emp.shift_number) },
    { label: "Soatlik stavka", value: `${Number(emp.hourly_rate).toLocaleString()} so'm` },
    { label: "Qo'shilgan sana", value: joinDate },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-red-400" />
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="relative shrink-0 self-start sm:self-auto">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-md" style={{ background: "linear-gradient(135deg, var(--primary), #b91c1c)" }}>
                {initials}
              </div>
              {emp.is_active && (
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-[3px] border-white bg-success flex items-center justify-center">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </span>
              )}
            </div>
            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{fullName}</h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${emp.is_active ? "bg-success/10 text-success border border-success/20" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                  {emp.is_active ? "Faol" : "Nofaol"}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1 truncate">{emp.position} · @{emp.user.username}</p>
            </div>
            {/* Score */}
            <ScoreRing score={emp.score} size={72} showLabel />
          </div>

          {/* Info pills */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
            {pills.map((it) => (
              <div key={it.label} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${it.color}, transparent 88%)` }}>
                  <it.icon size={16} style={{ color: it.color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{it.label}</div>
                  <div className="text-sm font-semibold text-slate-700 truncate">{it.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Batafsil ma'lumotlar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <User size={16} className="text-primary" /> Batafsil ma'lumotlar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          {details.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0 sm:[&:nth-last-child(2)]:border-0">
              <span className="text-sm text-slate-400 shrink-0">{r.label}</span>
              <span className="text-sm font-semibold text-slate-700 text-right truncate">{r.value || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Parol */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Lock size={16} className="text-primary" /> Parolni o'zgartirish
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">Xavfsizlik uchun kuchli parol tanlang</p>
        <div className="space-y-3 ">
          <input type="password" placeholder="Joriy parol" className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-slate-400" />
          <input type="password" placeholder="Yangi parol" className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-slate-400" />
          <input type="password" placeholder="Yangi parolni tasdiqlang" className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-slate-400" />
          <button className="px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]">
            Parolni yangilash
          </button>
        </div>
      </div>
    </div>
  );
}
