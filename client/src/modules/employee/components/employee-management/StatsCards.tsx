export function StatsCards({ statsCards }: { statsCards: any[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statsCards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-all hover:shadow-lg hover:shadow-slate-200/50">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${color}, transparent 90%)` }}>
            <Icon size={18} style={{ color }} />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
