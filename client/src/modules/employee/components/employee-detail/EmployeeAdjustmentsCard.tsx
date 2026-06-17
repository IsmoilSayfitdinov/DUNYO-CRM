import { Wallet, Award, CreditCard } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import type { SalaryAdjustment } from "@/modules/salary";

interface Props {
  /** Shu xodimning tanlangan oydagi avans/premiyalari (itemized). */
  adjustments?: SalaryAdjustment[];
  /** "Iyun 2026" kabi davr yorlig'i — sarlavhada ko'rsatiladi. */
  periodLabel: string;
  isLoading?: boolean;
}

const fmt = (n: number) => Number(n).toLocaleString("uz-UZ");

export function EmployeeAdjustmentsCard({ adjustments = [], periodLabel, isLoading = false }: Props) {
  // Umumiy summalar — sarlavha ostidagi ixcham KPI uchun.
  const totalAdvance = adjustments
    .filter((a) => a.type === "advance")
    .reduce((sum, a) => sum + Number(a.amount), 0);
  const totalBonus = adjustments
    .filter((a) => a.type === "bonus")
    .reduce((sum, a) => sum + Number(a.amount), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <Wallet size={18} className="text-slate-400 shrink-0" />
          <h3 className="font-semibold text-slate-900 truncate">Avans / Premiyalar</h3>
        </div>
        <span className="text-xs font-medium text-slate-400 shrink-0">{periodLabel}</span>
      </div>

      {/* Umumiy summalar — avans (ayiriladi) va premiya (qo'shiladi) */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
          <div className="flex items-center gap-1.5 text-amber-600 mb-1">
            <CreditCard size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Avans</span>
          </div>
          <div className="text-base font-black text-amber-700 tabular-nums">−{fmt(totalAdvance)}</div>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
            <Award size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Premiya</span>
          </div>
          <div className="text-base font-black text-emerald-700 tabular-nums">+{fmt(totalBonus)}</div>
        </div>
      </div>

      {/* Ro'yxat */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 -mr-1">
        {isLoading ? (
          <EmptyState variant="loading" size="sm" title="Yuklanmoqda…" />
        ) : adjustments.length === 0 ? (
          <EmptyState
            size="sm"
            icon={Wallet}
            title="Avans/premiya yo'q"
            description="Bu oy uchun hali avans yoki premiya berilmagan."
          />
        ) : (
          adjustments.map((a) => {
            const isBonus = a.type === "bonus";
            return (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isBonus ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {isBonus ? <Award size={16} /> : <CreditCard size={16} />}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">
                      {a.note || (isBonus ? "Premiya" : "Avans")}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isBonus ? "Premiya" : "Avans"} · {new Date(a.created_at).toLocaleDateString("uz-UZ")}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold tabular-nums shrink-0 ${
                    isBonus ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {isBonus ? "+" : "−"}
                  {fmt(Number(a.amount))}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
