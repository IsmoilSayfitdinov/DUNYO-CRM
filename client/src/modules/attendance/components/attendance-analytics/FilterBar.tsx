import { Search } from "lucide-react";
import CustomDatePicker from "@/shared/ui/CustomDatePicker";

export function FilterBar({ search, onSearchChange, dateRange, onDateRangeChange }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-wrap items-end gap-3 sm:gap-4 shadow-sm">
      <div className="space-y-1.5 w-full sm:flex-1 sm:min-w-[200px]">
        <label className="text-sm font-medium text-slate-700 ml-1">Qidiruv <span className="text-slate-400 font-normal">(reyting bo'yicha)</span></label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pl-9 pr-4 py-1.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Xodim ismini qidirish..."
          />
        </div>
      </div>

      <CustomDatePicker
        mode="range"
        value={dateRange}
        onChange={onDateRangeChange}
        label="Sana oralig'i (grafik va statistika uchun)"
        className="w-full sm:flex-1 sm:min-w-[260px]"
      />
    </div>
  );
}
