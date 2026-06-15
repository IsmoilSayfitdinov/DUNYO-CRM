import { DollarSign, CheckCircle, XCircle, TrendingUp } from "lucide-react";

export function SummaryKpis({ summary, sumTotal, sumPaid, sumUnpaid, sumAvg }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Jami ish haqi", value: `${(sumTotal / 1000000).toFixed(1)}M UZS`, icon: DollarSign, color: "var(--primary)", sub: "Tanlangan oy" },
        { label: "To'langan ish haqi", value: `${(sumPaid / 1000000).toFixed(1)}M UZS`, icon: CheckCircle, color: "var(--success)", sub: `${summary?.paid_count ?? 0} ta to'langan` },
        { label: "To'lanmagan ish haqi", value: `${(sumUnpaid / 1000000).toFixed(1)}M UZS`, icon: XCircle, color: "var(--destructive)", sub: `${summary?.unpaid_count ?? 0} ta kutilmoqda` },
        { label: "O'rtacha ish haqi", value: `${(sumAvg / 1000000).toFixed(2)}M UZS`, icon: TrendingUp, color: "var(--warning)", sub: `${summary?.total ?? 0} ta yozuv` },
      ].map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.label} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-5
            flex flex-row items-center gap-3 sm:flex-col sm:items-stretch sm:gap-0">
            {/* Ikonka — mobilда chapda, PC'da tepada */}
            <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 sm:mb-3" style={{ background: `color-mix(in srgb, ${kpi.color}, transparent 90%)` }}>
              <Icon size={18} className="sm:hidden" style={{ color: kpi.color }} />
              <Icon size={16} className="hidden sm:block" style={{ color: kpi.color }} />
            </div>
            {/* Matn bloki — mobilда ikonka yonida, PC'da ostida */}
            <div className="min-w-0 flex-1">
              <div className="text-lg sm:text-xl font-bold text-slate-900 leading-none mb-0.5 sm:mb-1">{kpi.value}</div>
              <div className="text-xs sm:text-sm text-slate-400 leading-tight">{kpi.label}</div>
              <div className="text-xs text-slate-400 mt-0.5 hidden sm:block">{kpi.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
