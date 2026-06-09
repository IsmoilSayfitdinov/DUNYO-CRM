import { Download } from "lucide-react";
import { MonthYearPicker } from "@/shared/ui/MonthYearPicker";

export function SalaryAnalyticsHeader({ period, onPeriodChange }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">{"Ish haqi tahlili"}</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{"Ish haqi haqida umumiy ma'lumot va to'lov holati"}</p>
      </div>
      <div className="flex items-center gap-3">
        <MonthYearPicker year={period.year} month={period.month} onChange={onPeriodChange} />
        <button className="flex items-center gap-2 text-sm bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-700 hover:bg-slate-50 h-11 shadow-sm transition-all">
          <Download size={14} /> {"Eksport"}
        </button>
      </div>
    </div>
  );
}
