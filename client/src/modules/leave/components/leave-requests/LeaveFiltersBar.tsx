import { Search } from "lucide-react";
import CustomSelect from "@/shared/ui/CustomSelect";

const LEAVE_TYPE_OPTIONS = [
  { value: "All", label: "Barchasi" },
  { value: "Kasallik ta'tili", label: "Kasallik ta'tili" },
  { value: "Yillik mehnat ta'tili", label: "Yillik mehnat ta'tili" },
  { value: "Shaxsiy sabab", label: "Shaxsiy sabab" },
  { value: "Shoshilinch", label: "Shoshilinch" },
];

export function LeaveFiltersBar({ search, onSearchChange, typeFilter, onTypeFilterChange }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
          {"Ta’til va so’rovlar"}
        </h1>
        <p className="mt-0.5 text-xs sm:text-sm text-slate-400">
          {"So’rovlarni ko’rib chiqish, tasdiqlash va kuzatish"}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400 ml-1">Qidiruv</label>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 sm:h-11 w-full sm:w-48 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
              placeholder={"Xodimni qidirish..."}
            />
          </div>
        </div>

        <CustomSelect
          label="Ta’til turi"
          options={LEAVE_TYPE_OPTIONS}
          value={typeFilter}
          onValueChange={(val) => onTypeFilterChange(val)}
          className="w-full sm:w-[180px]"
          searchable={false}
        />
      </div>
    </div>
  );
}
