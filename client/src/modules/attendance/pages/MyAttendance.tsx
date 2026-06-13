import React, { useMemo, useState } from "react";
import { Calendar, List, CheckCircle, Clock, Coins, Timer } from "lucide-react";
import { getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { MonthYearPicker } from "@/shared/ui/MonthYearPicker";
import { toHHMM, attendanceCalColor } from "@/shared/utils";
import { useMyAttendance } from "@/modules/attendance";

const STATUS_BADGE: Record<string, string> = {
  came: "Keldi", left: "Ishladi", late: "Kechikdi", absent: "Kelmadi",
  reason: "Sababli", leave: "Ta'tilda", on_leave: "Ta'tilda",
};
const pad = (n: number) => String(n).padStart(2, "0");

export function MyAttendance() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const year = period.year;
  const month = period.month - 1;
  const monthDate = new Date(year, month, 1);

  const { data, isLoading, isError } = useMyAttendance({ year, month: month + 1, limit: 100 });

  const records = useMemo(
    () =>
      (data?.items ?? []).map((a) => ({
        date: a.work_date,
        checkIn: toHHMM(a.check_in),
        checkOut: toHHMM(a.check_out),
        status: a.status,
        badge: STATUS_BADGE[a.status] ?? a.status,
        hours: Number(a.duration_hours) || 0,
        earned: Number(a.earned_amount) || 0,
      })),
    [data],
  );

  const presentDays = records.filter((r) => r.status === "came" || r.status === "left" || r.status === "late").length;
  const lateDays = records.filter((r) => r.status === "late").length;
  const totalHours = records.reduce((a, r) => a + r.hours, 0);
  const totalEarned = records.reduce((a, r) => a + r.earned, 0);

  // Kalendar
  const byDate = new Map(records.map((r) => [r.date, r]));
  const daysInMonth = getDaysInMonth(monthDate);
  const firstWeekday = (getDay(startOfMonth(monthDate)) + 6) % 7;

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Mening davomatim</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Yil va oy bo'yicha ish jarayonlaringiz</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <MonthYearPicker year={period.year} month={period.month} onChange={setPeriod} />
          <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1 h-11 items-center">
            <button onClick={() => setView("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "calendar" ? "bg-white text-primary shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-700"}`}>
              <Calendar size={14} /> Kalendar
            </button>
            <button onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "list" ? "bg-white text-primary shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-700"}`}>
              <List size={14} /> Jadval
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Kelgan kunlar", value: presentDays, icon: CheckCircle, color: "var(--success)" },
          { label: "Kechikishlar", value: lateDays, icon: Clock, color: "var(--warning)" },
          { label: "Jami soat", value: `${totalHours.toFixed(1)}h`, icon: Timer, color: "#64748b" },
          { label: "Jami ishlangan", value: `${totalEarned.toLocaleString()} so'm`, icon: Coins, color: "var(--primary)" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `color-mix(in srgb, ${s.color}, transparent 90%)` }}>
                <Icon size={18} style={{ color: s.color }} />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">{s.value}</div>
              <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200"><EmptyState variant="loading" title="Yuklanmoqda…" description="Davomat tarixingiz olinmoqda" /></div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-slate-200"><EmptyState variant="error" title="Yuklab bo'lmadi" description="Davomatni yuklab bo'lmadi." /></div>
      ) : view === "calendar" ? (
        /* ===== Kalendar ko'rinishi ===== */
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-4">
            {[
              { label: "Kelgan", color: "bg-success" },
              { label: "Kechikkan", color: "bg-warning" },
              { label: "Kelmagan", color: "bg-destructive" },
              { label: "Sababli", color: "bg-amber-500" },
              { label: "Ta'til", color: "bg-blue-500" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`w-2.5 h-2.5 rounded ${l.color}`} /> {l.label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"].map((d) => (
              <div key={d} className="text-center text-[10px] sm:text-xs font-bold text-slate-400 py-1 uppercase tracking-wider">{d}</div>
            ))}
            {Array.from({ length: firstWeekday }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const rec = byDate.get(`${year}-${pad(month + 1)}-${pad(day)}`);
              return (
                <div key={day} title={rec ? rec.badge : ""}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs sm:text-sm font-semibold transition-all ${attendanceCalColor(rec?.status)}`}>
                  <span>{day}</span>
                  {rec?.checkIn && <span className="text-[8px] sm:text-[9px] opacity-80 leading-none mt-0.5">{rec.checkIn}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ===== Jadval ko'rinishi ===== */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {records.length === 0 ? (
            <EmptyState icon={Calendar} title="Davomat yozuvlari yo'q" description="Tanlangan oy uchun davomat qaydlari mavjud emas." />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-slate-100">
                {records.map((r, i) => (
                  <div key={i} className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900">{r.date}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>{r.checkIn || "—"}</span><span>→</span><span>{r.checkOut || "—"}</span>
                        {r.hours > 0 && <span className="text-slate-300">·</span>}
                        {r.hours > 0 && <span>{r.hours}h</span>}
                      </div>
                    </div>
                    <StatusBadge status={r.badge as any} />
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Sana", "Kirish", "Chiqish", "Davomiylik", "Ishlangan summa", "Holat"].map((h) => (
                        <th key={h} className="text-left text-xs font-bold text-slate-400 px-5 py-4 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50">
                    {records.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 text-sm font-bold text-slate-900">{r.date}</td>
                        <td className="px-5 py-4 text-sm text-slate-600 font-bold">{r.checkIn || "—"}</td>
                        <td className="px-5 py-4 text-sm text-slate-400 font-medium">{r.checkOut || "—"}</td>
                        <td className="px-5 py-4 text-sm text-slate-500 font-medium">{r.hours > 0 ? `${r.hours}h` : "—"}</td>
                        <td className="px-5 py-4 text-sm font-bold text-primary">{r.earned > 0 ? `${r.earned.toLocaleString()} so'm` : "—"}</td>
                        <td className="px-5 py-4"><StatusBadge status={r.badge as any} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
