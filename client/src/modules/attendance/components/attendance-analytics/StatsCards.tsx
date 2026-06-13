import { Users, Clock, UserX, UserCheck } from "lucide-react";

interface Props {
  avgRate: number;
  totalLate: number;
  totalAbsent: number;
  totalPresent: number;
  rangeLabel?: string;
}

export function StatsCards({ avgRate, totalLate, totalAbsent, totalPresent, rangeLabel }: Props) {
  const cards = [
    { label: "O'rtacha davomat ko'rsatkichi", value: `${avgRate}%`, icon: Users, color: "var(--primary)" },
    { label: "Jami kelganlar", value: String(totalPresent), icon: UserCheck, color: "var(--success)" },
    { label: "Jami kechikishlar", value: String(totalLate), icon: Clock, color: "var(--warning)" },
    { label: "Jami kelmasliklar", value: String(totalAbsent), icon: UserX, color: "var(--destructive)" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2 sm:mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${s.color}, transparent 90%)` }}>
                <Icon size={16} style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-slate-900 tabular-nums">{s.value}</div>
            <div className="text-xs sm:text-sm text-slate-400 mt-0.5">{s.label}</div>
            {rangeLabel && <div className="text-xs text-slate-400 mt-0.5 truncate">{rangeLabel}</div>}
          </div>
        );
      })}
    </div>
  );
}
