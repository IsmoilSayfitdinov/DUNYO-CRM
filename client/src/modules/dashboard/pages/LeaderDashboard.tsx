import { useState } from "react";
import { useNavigate } from "react-router";
import { Users, UserCheck, UserX, Clock, Activity, DollarSign } from "lucide-react";
import { useAttendanceTrends } from "@/modules/attendance";
import { useDashboardOverview, useDashboardAlerts, useDashboardActivity, useTopEmployees, type DashboardPeriod } from "@/modules/dashboard";
import {
  DashboardHeader,
  KpiCards,
  AttendanceTrendChart,
  SalaryTrendChart,
  SmartAlerts,
  TopEmployees,
  AtRiskEmployees,
  ActivityFeed,
} from "../components/leader-dashboard";

const pad = (n: number) => String(n).padStart(2, "0");
const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const M = (n: number) => (n / 1_000_000).toFixed(1);

export function LeaderDashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<DashboardPeriod>("today");

  const periodOptions = [
    { value: "today", label: "Bugun" },
    { value: "week", label: "Shu hafta" },
    { value: "month", label: "Shu oy" },
  ];
  const periodLabel = period === "today" ? "Bugun" : period === "week" ? "Shu hafta" : "Shu oy";

  // Real API: umumiy ko'rsatkichlar (period bo'yicha) + ogohlantirishlar + harakatlar
  const { data: overview } = useDashboardOverview(period);
  const { data: alerts } = useDashboardAlerts();
  const { data: activity } = useDashboardActivity(20);

  // Davomat trendi — oxirgi 8 kun (mavjud trends endpoint)
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  const { data: attTrends } = useAttendanceTrends(toStr(start), toStr(end));

  // Reyting — bitta endpointdan: eng yaxshi 5 + xavf ostidagilar (eng past ballar)
  const { data: ranking } = useTopEmployees(50);
  const topEmployees = (ranking ?? []).slice(0, 5);
  const atRisk = [...(ranking ?? [])]
    .filter((e) => e.score < 85)
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map((e) => ({
      employee_id: e.employee_id,
      name: e.name,
      score: e.score,
      attendancePct: e.total_days > 0 ? Math.round((e.present_days / e.total_days) * 100) : 0,
    }));

  const kpis = [
    { label: "Jami xodimlar", value: String(overview?.total_employees ?? "—"), sub: "Faol xodimlar", icon: Users, onClick: () => navigate("/leader/staff") },
    { label: "Kelganlar", value: String(overview?.present_today ?? "—"), sub: `${periodLabel} · ${overview?.total_employees ?? 0} tadan`, icon: UserCheck, onClick: () => navigate("/leader/today") },
    { label: "Kelmaganlar", value: String(overview?.absent_today ?? "—"), sub: periodLabel, icon: UserX, onClick: () => navigate("/leader/attendance") },
    { label: "Kechikkanlar", value: String(overview?.late_today ?? "—"), sub: periodLabel, icon: Clock, onClick: () => navigate("/leader/attendance") },
    { label: "Davomat ko'rsatkichi", value: overview ? `${overview.attendance_rate}%` : "—", sub: periodLabel, icon: Activity },
    { label: "Jami ish haqi", value: overview ? `${M(Number(overview.total_payroll))}M` : "—", sub: `${periodLabel} · UZS`, icon: DollarSign, onClick: () => navigate("/leader/salary") },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8 bg-gray-50/50">
      <DashboardHeader dateOptions={periodOptions} dateRange={period} setDateRange={setPeriod} />

      {/* Ko'rsatkichlar — yuqoridagi davr (period) filtriga bog'langan */}
      <div>
        <div className="flex items-baseline gap-2 mb-3">
          <h2 className="text-sm font-bold text-gray-700">Ko'rsatkichlar</h2>
          <span className="text-xs font-medium text-gray-400">· {periodLabel}</span>
        </div>
        <KpiCards kpis={kpis} />
      </div>

      <AttendanceTrendChart attendanceTrend={attTrends ?? []} />

      {/* Salary chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SalaryTrendChart />
        <SmartAlerts alerts={alerts} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <TopEmployees topEmployees={topEmployees} />
        <AtRiskEmployees atRisk={atRisk} />
        <ActivityFeed activity={activity} />
      </div>
    </div>
  );
}
