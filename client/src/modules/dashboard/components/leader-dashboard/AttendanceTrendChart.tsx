import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

export function AttendanceTrendChart({ attendanceTrend }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Davomat tendentsiyasi</h3>
            <p className="text-xs font-medium text-gray-400 mt-1">Oxirgi 8 kun · kundalik ko'rsatkichlar</p>
          </div>
          <div className="flex items-center gap-3 md:gap-6 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-gray-400 flex-wrap">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Kelgan</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-400" />Kelmagan</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" />Kechikkan</span>
          </div>
        </div>
        <div className="h-[200px] md:h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendanceTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", padding: 12 }}
                labelStyle={{ color: "#111827", fontWeight: 800, marginBottom: 4 }}
              />
              <Area type="monotone" dataKey="present" stroke="#10B981" fill="url(#gPresent)" strokeWidth={3} dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="absent" stroke="#EF4444" fill="none" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="late" stroke="#F59E0B" fill="none" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
