import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export function DailyTrendChart({ trends, rangeLabel }: { trends?: any[]; rangeLabel?: string }) {
  const data = trends ?? [];
  return (
    <div className="gap-5">
      {/* Daily trend — yuqoridagi "Sana oralig'i" filtriga bog'langan */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900">Kundalik davomat</h3>
            <p className="text-xs text-slate-400 truncate">Tanlangan oraliq: {rangeLabel ?? "—"}</p>
          </div>
        </div>
        {data.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-sm text-slate-400">Tanlangan oraliq uchun ma'lumot yo'q</div>
        ) : (
        <ResponsiveContainer width="100%" height={260} className="ml-[-15px]">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gP2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0" }} />
            <Area type="monotone" dataKey="present" name={"Kelgan"} stroke="var(--success)" fill="url(#gP2)" strokeWidth={2} dot={{ r: 3, fill: "var(--success)" }} />
            <Area type="monotone" dataKey="late" name={"Kechikkan"} stroke="var(--warning)" fill="none" strokeWidth={2} dot={{ r: 3, fill: "var(--warning)" }} />
            <Area type="monotone" dataKey="absent" name={"Kelmagan"} stroke="var(--destructive)" fill="none" strokeWidth={2} strokeDasharray="4 2" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
