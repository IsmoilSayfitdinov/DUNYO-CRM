import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useMySalary } from "@/modules/salary";

const num = (v: string | number) => Number(v) || 0;
const monthLabel = (m: string) => String(m).slice(0, 7); // "2026-06"
// Pulni TO'LIQ ko'rsatamiz (oldin .toFixed(2)+'M' edi — ~10 000 so'm aniqlik
// yo'qolardi; xodim o'z oyligini aniq ko'ra olmasdi). Probel bilan to'liq son.
const fmt = (n: number) => Math.round(n).toLocaleString("uz-UZ");

export function MySalary() {
  const { data, isLoading, isError } = useMySalary({ limit: 24 });

  if (isLoading) {
    return <EmptyState variant="loading" title="Yuklanmoqda…" description="Ish haqi ma'lumoti olinmoqda" />;
  }
  if (isError || !data) {
    return <EmptyState variant="error" title="Yuklab bo'lmadi" description="Ish haqi ma'lumotini yuklab bo'lmadi." />;
  }
  if (data.length === 0) {
    return (
      <div className="p-3 sm:p-4 md:p-6 ">
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">Ish haqi ma'lumotlari</h1>
        <div className="bg-white rounded-2xl border border-slate-200"><EmptyState title="Ish haqi yo'q" description="Hozircha hisoblangan ish haqi mavjud emas." /></div>
      </div>
    );
  }

  const current = data[0];
  const chartData = [...data].reverse().map((s) => ({ month: monthLabel(s.month), total: num(s.final_salary) }));

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 ">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Ish haqi ma'lumotlari</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Oylik maoshlaringiz va to'lovlar tarixingiz</p>
      </div>

      {/* Current month — clean neutral card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Joriy oy · {monthLabel(current.month)}</p>
            <h2 className="text-2xl sm:text-3xl font-black mt-1.5 tracking-tight text-slate-900 tabular-nums">
              {fmt(num(current.final_salary))} <span className="text-lg font-bold text-slate-400">UZS</span>
            </h2>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider border ${current.is_paid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${current.is_paid ? "bg-emerald-500" : "bg-amber-500"}`} />
            {current.is_paid ? "To'langan" : "To'lanmagan"}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Asosiy maosh", value: fmt(num(current.base_salary)) },
            { label: "Bonus", value: num(current.bonus) > 0 ? `+${fmt(num(current.bonus))}` : "—" },
            { label: "Ishlangan soat", value: `${current.total_hours}h` },
            { label: "Ishlangan kun", value: String(current.days_worked) },
          ].map((s) => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200/70">
              <div className="text-base font-bold tabular-nums text-slate-900">{s.value}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend chart */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5">
          <h3 className="font-semibold text-slate-900 mb-1">Maosh dinamikasi</h3>
          <p className="text-xs text-slate-400 mb-4">Oxirgi {chartData.length} oy</p>
          <div className="h-[200px] sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gMySal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} formatter={(v: number) => [`${(v / 1000000).toFixed(2)}M UZS`, "Ish haqi"]} />
                <Area type="monotone" dataKey="total" stroke="var(--primary)" fill="url(#gMySal)" strokeWidth={3} dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "#fff" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-200/50">
          <h3 className="text-sm sm:text-base font-semibold text-slate-900">To'lovlar tarixi</h3>
          <button className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-700">
            <Download size={13} /> <span className="hidden sm:inline">Eksport</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3">Oy</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3 hidden md:table-cell">Soat</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3 hidden md:table-cell">Bonus</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3">Jami</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {data.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 sm:px-5 py-3.5 text-sm font-medium text-slate-800">{monthLabel(s.month)}</td>
                  <td className="px-3 sm:px-5 py-3.5 text-sm text-slate-600 hidden md:table-cell">{s.total_hours}h</td>
                  <td className="px-3 sm:px-5 py-3.5 text-sm text-primary font-bold hidden md:table-cell tabular-nums">{num(s.bonus) > 0 ? `+${fmt(num(s.bonus))}` : "—"}</td>
                  <td className="px-3 sm:px-5 py-3.5 text-sm font-bold text-slate-900 tabular-nums">{fmt(num(s.final_salary))}</td>
                  <td className="px-3 sm:px-5 py-3.5"><StatusBadge status={(s.is_paid ? "Paid" : "Unpaid") as any} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
