export function LeaveStatsCards({ total, pendingCount, approvedCount, rejectedCount }: any) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[
        { label: "Jami so’rovlar", value: total, color: "var(--primary)" },
        { label: "Kutilayotgan", value: pendingCount, color: "var(--warning)" },
        { label: "Tasdiqlangan", value: approvedCount, color: "var(--success)" },
        { label: "Rad etilgan", value: rejectedCount, color: "var(--destructive)" },
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 transition-all hover:shadow-lg hover:shadow-slate-200/50"
        >
          <div
            className="mb-1 text-xl sm:text-3xl font-black tracking-tight"
            style={{ color: item.color }}
          >
            {item.value}
          </div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
