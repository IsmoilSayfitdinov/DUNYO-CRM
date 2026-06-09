import { useState, useEffect } from "react";
import { Activity, UserCheck, UserX, Clock, RefreshCw, Wifi } from "lucide-react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useEmployees } from "@/modules/employee";
import { useTeamAttendance } from "@/modules/attendance";
import { useDashboardActivity } from "@/modules/dashboard";
import { toHHMM, ATTENDANCE_BADGE } from "@/shared/utils";

const pad = (n: number) => String(n).padStart(2, "0");
const todayStr = (() => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
const hue = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
const relTime = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "hozir";
  if (diff < 3600) return `${Math.floor(diff / 60)} daq oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  return `${Math.floor(diff / 86400)} kun oldin`;
};

export function RealTimeMonitoring() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Real API: barcha xodimlar + bugungi jamoa davomati + jonli harakatlar
  const { data: empData } = useEmployees({ limit: 100, offset: 0 });
  const { data: team, isLoading, refetch, isFetching } = useTeamAttendance(todayStr);
  const { data: activity } = useDashboardActivity(10);

  const teamMap = new Map((team ?? []).map((a) => [a.employee_id, a]));
  const roster = (empData?.items ?? []).map((emp) => {
    const rec = teamMap.get(emp.id);
    const name = `${emp.user.first_name ?? ""} ${emp.user.last_name ?? ""}`.trim() || emp.user.username;
    return {
      id: emp.id,
      name,
      position: emp.position ?? "",
      shift: `${(emp.shift_start || "").slice(0, 5)}–${(emp.shift_end || "").slice(0, 5)}`,
      checkIn: toHHMM(rec?.check_in ?? null),
      checkOut: toHHMM(rec?.check_out ?? null),
      status: rec ? (ATTENDANCE_BADGE[rec.status] ?? rec.status) : "Kelmadi",
      hasIn: !!rec?.check_in,
      hasOut: !!rec?.check_out,
    };
  });

  const checkedIn = roster.filter((r) => r.status === "Keldi" || r.status === "Kechikdi");
  const currentlyWorking = checkedIn.filter((r) => r.hasIn && !r.hasOut);
  const checkedOut = roster.filter((r) => r.hasOut);
  const absentLeave = roster.filter((r) => r.status === "Kelmadi" || r.status === "Sababli" || r.status === "Ta'tilda");

  const stats = [
    { label: "Kelganlar", value: checkedIn.length, icon: UserCheck, color: "var(--success)" },
    { label: "Hozir ishda", value: currentlyWorking.length, icon: Activity, color: "var(--primary)" },
    { label: "Ketganlar", value: checkedOut.length, icon: Clock, color: "#94A3B8" },
    { label: "Kelmagan / Ta'tilda", value: absentLeave.length, icon: UserX, color: "var(--destructive)" },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Real vaqt rejimidagi monitoring</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Jonli davomat holati · {time.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-success/10 text-success text-sm px-3 py-1.5 rounded-full border border-success/20">
            <Wifi size={14} />
            <span>Jonli</span>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>
          <button onClick={() => refetch()} disabled={isFetching} className="flex items-center gap-2 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-60">
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} /> Yangilash
          </button>
        </div>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-5 transition-all hover:shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${s.color}, transparent 90%)` }}>
                  <Icon size={20} style={{ color: s.color }} />
                </div>
                <div className="w-2 h-2 rounded-full animate-pulse ml-auto" style={{ background: s.color }} />
              </div>
              <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1 tabular-nums">{s.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Live status board */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-3 sm:px-5 py-4 border-b border-slate-200/50 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <h3 className="font-semibold text-slate-900">Jonli holat doskasi</h3>
          <span className="text-xs text-slate-400 shrink-0">{time.toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" })} · {time.toLocaleTimeString()}</span>
        </div>
        {isLoading ? (
          <EmptyState variant="loading" title="Yuklanmoqda…" description="Jonli holat olinmoqda" />
        ) : roster.length === 0 ? (
          <EmptyState title="Xodim yo'q" description="Ma'lumot mavjud emas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["Xodim", "Lavozim", "Smena", "Kirish", "Chiqish", "Joriy holat"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {roster.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 sm:px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: `hsl(${hue(r.id)}, 65%, 55%)` }}>
                            {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          {r.hasIn && !r.hasOut && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-800 truncate">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3.5 text-sm text-slate-400 whitespace-nowrap">{r.position || "—"}</td>
                    <td className="px-3 sm:px-5 py-3.5 text-sm text-slate-400 whitespace-nowrap">{r.shift}</td>
                    <td className="px-3 sm:px-5 py-3.5 text-sm font-medium text-slate-800">{r.checkIn || "—"}</td>
                    <td className="px-3 sm:px-5 py-3.5 text-sm text-slate-400">{r.checkOut || "—"}</td>
                    <td className="px-3 sm:px-5 py-3.5"><StatusBadge status={r.status as any} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live activity feed (real) */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-primary" />
          <h3 className="font-semibold text-slate-900">Jonli faollik tasmasi</h3>
        </div>
        {(activity ?? []).length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">Harakatlar yo'q</p>
        ) : (
          <div className="space-y-0">
            {(activity ?? []).slice(0, 8).map((item, i) => {
              const isCheckin = String(item.type).includes("check_in") || String(item.type).includes("checkin");
              return (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-200/30 last:border-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isCheckin ? "bg-success/10" : "bg-slate-100"}`}>
                    {isCheckin ? <UserCheck size={13} className="text-success" /> : <Clock size={13} className="text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800">
                      <span className="font-medium">{item.employee_name}</span> <span className="text-slate-400">{item.message}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{relTime(item.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
