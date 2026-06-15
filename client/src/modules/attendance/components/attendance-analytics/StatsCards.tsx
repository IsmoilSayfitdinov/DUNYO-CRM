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
          <div key={s.label} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow
            flex flex-row items-center gap-3 sm:flex-col sm:items-stretch sm:gap-0">
            {/* Ikonka — mobilда chapda, PC'da tepada */}
            <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 sm:mb-3" style={{ background: `color-mix(in srgb, ${s.color}, transparent 90%)` }}>
              <Icon size={18} className="sm:hidden" style={{ color: s.color }} />
              <Icon size={16} className="hidden sm:block" style={{ color: s.color }} />
            </div>
            {/* Matn bloki — mobilда ikonka yonida, PC'da ostida */}
            <div className="min-w-0 flex-1">
              <div className="text-xl sm:text-2xl font-semibold text-slate-900 tabular-nums leading-none">{s.value}</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1 leading-tight">{s.label}</div>
              {rangeLabel && <div className="text-xs text-slate-400 mt-0.5 hidden sm:block">{rangeLabel}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
