import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useSalaryTrend } from "@/modules/salary";

const MONTHS_UZ_SHORT = ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"];
const fmtMonth = (iso: string) => {
  const [, m] = String(iso).slice(0, 7).split("-").map(Number);
  return MONTHS_UZ_SHORT[(m || 1) - 1] ?? String(iso);
};

export function PayrollTrendChart() {
  const { data } = useSalaryTrend();
  // Yillik ko'rinish — oxirgi 12 oy (eskidan yangiga tartiblab)
  const chartData = [...(data ?? [])]
    .sort((a, b) => String(a.month).localeCompare(String(b.month)))
    .map((d) => ({ month: fmtMonth(d.month), total: Number(d.total) || 0 }))
    .slice(-12);

  return (
    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">Ish haqi tendentsiyasi</h3>
      <p className="text-xs text-slate-400 mb-4">Yillik dinamika (oxirgi 12 oy) · UZS</p>
      {chartData.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center">
          <EmptyState size="sm" icon={BarChart3} title="Ma'lumot yo'q" description="Ish haqi tendentsiyasi uchun hali ma'lumot mavjud emas." />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gSal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: 12 }} formatter={(v: number) => [`${(v / 1000000).toFixed(1)}M UZS`, "Jami ish haqi"]} />
            <Area type="monotone" dataKey="total" stroke="var(--primary)" fill="url(#gSal)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
