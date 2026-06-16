import React from "react";
import { useNavigate } from "react-router";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Scan, FileText, Calendar, CheckSquare, Bell, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { toHHMM } from "@/shared/utils";
import { useMyEmployee } from "@/modules/employee";
import { useMySalary } from "@/modules/salary";
import { useMyAttendance, useMyWeeklyAttendance } from "@/modules/attendance";
import { useNotifications } from "@/modules/notification";
import { useMyTasks, STATUS_LABEL, STATUS_STYLE, isOverdue } from "@/modules/task";

const STATUS_BADGE: Record<string, string> = { came: "Keldi", left: "Keldi", late: "Kechikdi", absent: "Kelmadi", reason: "Sababli", leave: "Ta'tilda" };

const MONTHS_UZ_SHORT = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const fmtDate = (iso: string) => {
  const p = String(iso).slice(0, 10).split("-").map(Number);
  if (p.length < 3 || !p[1]) return String(iso);
  return `${p[2]}-${MONTHS_UZ_SHORT[p[1] - 1] ?? ""}`;
};
const attStatusStyle = (status: string) => {
  if (status === "came") return { bg: "bg-success/10", text: "text-success" };
  if (status === "late") return { bg: "bg-warning/10", text: "text-warning" };
  if (status === "absent") return { bg: "bg-destructive/10", text: "text-destructive" };
  if (status === "leave" || status === "on_leave") return { bg: "bg-blue-500/10", text: "text-blue-500" };
  return { bg: "bg-slate-100", text: "text-slate-400" };
};

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const { data: emp, isLoading } = useMyEmployee();
  const { data: salaryList } = useMySalary({ limit: 1 });
  const currentSalary = salaryList?.[0];
  const { data: attData } = useMyAttendance({ limit: 10 });
  const { data: recentNotifs = [] } = useNotifications(3);
  const now = new Date();
  const { data: weekly } = useMyWeeklyAttendance(now.getFullYear(), now.getMonth() + 1);

  // Vazifalar (real)
  const { data: myTasks = [] } = useMyTasks();
  const overdueTasks = myTasks.filter((t) => isOverdue(t.due_date, t.status));
  const recentAtt = (attData?.items ?? []).slice(0, 3);

  if (isLoading) {
    return <EmptyState variant="loading" title="Yuklanmoqda…" description="Boshqaruv paneli tayyorlanmoqda" />;
  }

  const fullName = emp ? `${emp.user.first_name} ${emp.user.last_name}`.trim() || emp.user.username : "—";
  const initials = (emp ? (`${emp.user.first_name} ${emp.user.last_name}`.trim() || emp.user.username) : "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const lastCheckIn = toHHMM(attData?.items?.[0]?.check_in ?? null);

  // Real: oy ichidagi haftalik kelgan kunlar (W1–W4)
  const attendanceChart = (weekly ?? []).map((w) => ({ week: w.week, present: w.days }));

  const quickActions = [
    { icon: Scan, label: "Skaner", desc: "Davomat skanerini ochish", path: "/employee/scanner", color: "var(--primary)" },
    { icon: FileText, label: "Ta'til so'rash", desc: "Ta'til so'rovini yuborish", path: "/employee/leave", color: "var(--primary)" },
    { icon: Calendar, label: "Davomat tarixi", desc: "Yozuvlarimni ko'rish", path: "/employee/attendance", color: "var(--primary)" },
    { icon: CheckSquare, label: "Vazifalarim", desc: `${myTasks.length} ta vazifa`, path: "/employee/tasks", color: "var(--primary)" },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Welcome */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-red-600 to-red-700 rounded-2xl md:rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-red-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-6 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-center gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-2xl font-black shrink-0 shadow-inner">
            {initials}
          </div>
          {/* Greeting */}
          <div className="flex-1 min-w-0">
            <p className="text-red-100/90 text-xs sm:text-sm font-medium">Xayrli kun 👋</p>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight truncate">{fullName}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm">
              <span className="bg-white/15 text-white px-2.5 py-0.5 rounded-md backdrop-blur-md font-medium">{emp?.position ?? "—"}</span>
              <span className="text-red-100/80">@{emp?.user.username ?? ""}</span>
              <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] ${emp?.is_active ? "bg-emerald-400/25 text-white" : "bg-black/25 text-white/80"}`}>
                {emp?.is_active ? "● Faol" : "Nofaol"}
              </span>
            </div>
          </div>
          {/* Last check-in */}
          {lastCheckIn && (
            <div className="hidden sm:flex shrink-0 bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl items-center gap-3">
              <Clock size={18} className="text-red-100" />
              <div>
                <div className="text-[10px] text-red-100/80 uppercase tracking-wider font-bold leading-none">Oxirgi kirish</div>
                <div className="text-base font-bold leading-tight tabular-nums">{lastCheckIn}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Today summary — mobilда ixcham (ikon chapda, matn o'ngда), sm+ vertikal */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Oxirgi kirish", value: lastCheckIn || "—", sub: "Kirish vaqti", icon: Clock },
          { label: "Intizom bali", value: String(emp?.score ?? "—"), sub: "Ko'rsatkich", icon: TrendingUp },
          { label: "Vazifalar", value: String(myTasks.length), sub: `${overdueTasks.length} ta muddati o'tgan`, icon: FileText },
          { label: "Soatlik stavka", value: emp ? Number(emp.hourly_rate).toLocaleString() : "—", sub: "so'm/soat", icon: Calendar },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 transition-all hover:shadow-xl hover:shadow-red-500/5 group
            flex flex-row items-center gap-3 sm:flex-col sm:items-stretch sm:gap-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-50/50 flex items-center justify-center shrink-0 sm:mb-4 transition-transform group-hover:scale-110 duration-300">
              <s.icon size={20} className="sm:hidden" style={{ color: "var(--primary)" }} />
              <s.icon size={22} className="hidden sm:block" style={{ color: "var(--primary)" }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xl sm:text-2xl font-black text-slate-900 mb-0.5 sm:mb-1 leading-none tabular-nums truncate">{s.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide sm:tracking-widest leading-tight">{s.label}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-1 italic hidden sm:block">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Tezkor amallar</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `color-mix(in srgb, ${action.color}, transparent 85%)` }}>
                  <Icon size={16} style={{ color: action.color }} />
                </div>
                <div className="text-sm font-semibold text-slate-800">{action.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{action.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-3 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <Calendar size={17} className="text-success" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 leading-tight truncate">Mening davomatim</h3>
                <p className="text-[11px] text-slate-400">Haftalar bo'yicha kelgan kunlar</p>
              </div>
            </div>
            <button onClick={() => navigate("/employee/attendance")} className="shrink-0 text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium">
              <span className="hidden sm:inline">Barchasi</span> <ChevronRight size={14} />
            </button>
          </div>

          <div className="h-[150px] sm:h-[170px]">
            {attendanceChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">Ma'lumot yo'q</div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendanceChart} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gMyAtt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 7]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: 12 }} formatter={(v: number) => [`${v} kun`, "Kelgan kunlar"]} />
              <Area type="monotone" dataKey="present" name="Kelgan kunlar" stroke="var(--success)" fill="url(#gMyAtt)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--success)", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
            )}
          </div>

          {/* Recent records (real) */}
          <div className="mt-5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Oxirgi yozuvlar</div>
            {recentAtt.length === 0 ? (
              <EmptyState size="sm" icon={Calendar} title="Davomat yozuvlari yo'q" description="Skaner orqali kelishingizni qayd eting." />
            ) : (
              <div className="space-y-2">
                {recentAtt.map((r, i) => {
                  const st = attStatusStyle(r.status);
                  return (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/60 hover:bg-slate-50 transition-colors">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${st.bg}`}>
                        <Clock size={15} className={st.text} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-800">{fmtDate(r.work_date)}</div>
                        <div className="text-[11px] text-slate-400 tabular-nums">{toHHMM(r.check_in) || "—"} → {toHHMM(r.check_out) || "—"}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StatusBadge status={(STATUS_BADGE[r.status] ?? r.status) as any} />
                        {r.duration_hours ? <span className="text-[11px] font-semibold text-slate-500 tabular-nums">{r.duration_hours}h</span> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Salary (real) */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Ish haqi</h3>
              {currentSalary && <StatusBadge status={(currentSalary.is_paid ? "Paid" : "Unpaid") as any} />}
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-3">
              {currentSalary ? `${(Number(currentSalary.final_salary) / 1000000).toFixed(2)}M UZS` : "—"}
            </div>
            <div className="space-y-1.5">
              {currentSalary && [
                { label: "Stavka", value: Number(currentSalary.base_salary), color: "text-slate-700" },
                { label: "Bonus", value: Number(currentSalary.bonus), color: "text-primary" },
                { label: "Ishlangan soat", value: Number(currentSalary.total_hours), color: "text-slate-700", hours: true },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{s.label}</span>
                  <span className={`font-medium ${s.color}`}>{s.hours ? `${s.value}h` : `${(s.value / 1000000).toFixed(2)}M`}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/employee/salary")} className="mt-3 w-full text-xs text-primary hover:text-primary/80 flex items-center justify-center gap-1">
              To'liq maosh tarixini ko'rish <ChevronRight size={12} />
            </button>
          </div>

          {/* My Tasks (real) */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Vazifalarim</h3>
              {overdueTasks.length > 0 && (
                <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                  {overdueTasks.length} ta muddati o'tgan
                </span>
              )}
            </div>
            {myTasks.length === 0 ? (
              <EmptyState size="sm" icon={CheckSquare} title="Vazifa yo'q" description="Hozircha sizga biriktirilgan vazifa yo'q" />
            ) : (
              <div className="space-y-2">
                {myTasks.slice(0, 3).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/50">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{t.title}</div>
                      <div className="text-xs text-slate-400">Muddati: {t.due_date}</div>
                    </div>
                    <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[t.status]}`}>
                      {STATUS_LABEL[t.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications (real) */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Oxirgi bildirishnomalar</h3>
          <button onClick={() => navigate("/employee/notifications")} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
            Barchasini ko'rish <ChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {recentNotifs.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Bildirishnoma yo'q</p>
          ) : (
            recentNotifs.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all ${n.is_read ? "bg-slate-50" : "bg-red-50 border border-red-100"}`}>
                <Bell size={14} className={n.is_read ? "text-slate-400 mt-0.5" : "text-primary mt-0.5"} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800">{n.title}</div>
                  {n.body && <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.body}</div>}
                </div>
                <span className="text-xs text-slate-400 shrink-0">{toHHMM(n.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
