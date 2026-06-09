import { Wallet, DollarSign, Award } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import type { SalaryHistory } from "@/modules/salary";

const M = (n: number) => (n / 1_000_000).toFixed(2);

interface Props {
  salaryData?: SalaryHistory[];
  /** To'lanmagan oy yozuviga premiya qo'shish (real salary_id bilan). */
  onAdjustBonus?: (salaryId: string) => void;
}

export function SalaryHistoryCard({ salaryData, onAdjustBonus }: Props) {
  const rows = (salaryData ?? []).map((s) => ({
    id: s.id,
    month: String(s.month).slice(0, 7),
    bonus: Number(s.bonus) || 0,
    total: Number(s.final_salary) || 0,
    hours: s.total_hours,
    days: s.days_worked,
    isPaid: s.is_paid,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Ish haqi tarixi</h3>
        {rows.length > 0 && <span className="text-xs font-medium text-slate-400">{rows.length} oy</span>}
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 -mr-1">
        {rows.length === 0 ? (
          <EmptyState size="sm" icon={DollarSign} title="Ish haqi yo'q" description="Bu xodim uchun hisoblangan ish haqi mavjud emas." />
        ) : rows.map((s) => (
          <div key={s.id} className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border ${s.isPaid ? " border-green-100 bg-green-50/100" : " border-orange-100 bg-orange-50/100"} hover:bg-white hover:shadow-sm transition-all`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.isPaid ? "bg-success/10 text-success" : "bg-amber-100 text-amber-600"}`}>
                <Wallet size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-800">{s.month}</div>
                <div className="text-[11px] text-slate-400 truncate">
                  {s.hours}h · {s.days} kun
                  {s.bonus > 0 && <span className="text-success font-semibold"> · +{M(s.bonus)}M bonus</span>}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-sm font-black text-slate-900">{M(s.total)}M <span className="text-[10px] font-bold text-slate-400">UZS</span></span>
              <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${s.isPaid ? "bg-success/10 text-success border border-success/20" : "bg-amber-100 text-amber-700 border border-amber-200"}`}>
                {s.isPaid ? "To'langan" : "Kutilmoqda"}
              </span>
              {!s.isPaid && onAdjustBonus && (
                <button
                  onClick={() => onAdjustBonus(s.id)}
                  className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <Award size={11} /> Premiya
                </button>
              )}
            </div>
          </div>
                
        ))}
      </div>
    </div>
  );
}
