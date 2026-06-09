import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export function PaidVsUnpaidPie({ paidVsUnpaid, periodLabel }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{"To'lov holati"}</h3>
      <p className="text-xs text-slate-400 mb-4">{periodLabel}</p>
      <ResponsiveContainer width="100%" height={150}>
        <PieChart>
          <Pie data={paidVsUnpaid} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
            {paidVsUnpaid.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0" }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-2">
        {paidVsUnpaid.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600"><span className="w-2 h-2 rounded-full" style={{ background: d.color }} />{d.name}</span>
            <span className="font-semibold text-slate-900">{d.value} {"xodimlar"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
