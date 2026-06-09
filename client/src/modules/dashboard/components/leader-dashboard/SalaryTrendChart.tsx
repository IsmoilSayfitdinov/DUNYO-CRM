import { DollarSign } from "lucide-react";
import { useSalarySummary } from "@/modules/salary";

const M = (n: number) => (n / 1_000_000).toFixed(2);

export function SalaryTrendChart() {
  const now = new Date();
  const { data: summary } = useSalarySummary(now.getFullYear(), now.getMonth() + 1);

  const paid = Number(summary?.total_paid ?? 0);
  const unpaid = Number(summary?.total_unpaid ?? 0);
  const total = paid + unpaid;
  const paidPct = total > 0 ? (paid / total) * 100 : 0;
  const paidCount = summary?.paid_count ?? 0;
  const unpaidCount = summary?.unpaid_count ?? 0;

  return (
    <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">Joriy oy ish haqi</h3>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Umumiy hisoblangan · UZS</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <DollarSign size={20} className="text-primary" />
        </div>
      </div>

      {/* Jami summa */}
      <div className="mb-5">
        <div className="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums">
          {M(total)}M <span className="text-base sm:text-lg text-slate-400 font-bold">UZS</span>
        </div>
        <div className="text-xs text-slate-400 mt-1">{summary?.total ?? 0} ta xodim bo'yicha jami</div>
      </div>

      {/* To'langan / To'lanmagan taqsimoti */}
      <div className="space-y-2 mb-5">
        <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
          <div className="bg-success transition-all duration-500" style={{ width: `${paidPct}%` }} />
          <div className="bg-destructive transition-all duration-500" style={{ width: `${100 - paidPct}%` }} />
        </div>
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium">
          <span className="text-success">To'langan {paidPct.toFixed(0)}%</span>
          <span className="text-destructive">To'lanmagan {(100 - paidPct).toFixed(0)}%</span>
        </div>
      </div>

      {/* Stat kartalar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-success/5 border border-success/15 rounded-xl p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">To'langan</div>
          <div className="text-lg sm:text-xl font-black text-success mt-1 tabular-nums">{M(paid)}M</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{paidCount} ta xodim</div>
        </div>
        <div className="bg-destructive/5 border border-destructive/15 rounded-xl p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">To'lanmagan</div>
          <div className="text-lg sm:text-xl font-black text-destructive mt-1 tabular-nums">{M(unpaid)}M</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{unpaidCount} ta xodim</div>
        </div>
      </div>
    </div>
  );
}
