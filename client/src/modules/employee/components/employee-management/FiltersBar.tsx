import { Search } from "lucide-react";
import CustomSelect from "@/shared/ui/CustomSelect";

const STATUS_OPTIONS = [
  { value: "All", label: "Barcha holatlar" },
  { value: "active", label: "Faol" },
  { value: "inactive", label: "Nofaol" },
];

export function FiltersBar({ search, onSearchChange, statusFilter, onStatusChange, branchFilter, onBranchChange, branchOptions, count }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-wrap items-end gap-3 sm:gap-4 shadow-sm">
      <div className="space-y-1.5 w-full sm:flex-[2] sm:min-w-[200px]">
        <label className="text-sm font-medium text-slate-700 ml-1">Qidiruv</label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 sm:h-11 pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder={"Ism, username yoki lavozim…"}
          />
        </div>
      </div>

      {/* Filial bo'yicha filter */}
      {branchOptions && (
        <CustomSelect
          label="Filial"
          options={branchOptions}
          value={branchFilter}
          onValueChange={onBranchChange}
          className="w-full sm:flex-1 sm:min-w-[160px]"
          searchable={false}
        />
      )}

      <CustomSelect
        label="Holat"
        options={STATUS_OPTIONS}
        value={statusFilter}
        onValueChange={onStatusChange}
        className="w-full sm:flex-1 sm:min-w-[160px]"
        searchable={false}
      />

      <div className="flex items-center justify-end h-11 px-2">
        <span className="text-xs text-slate-400">{count} {"ta xodim"}</span>
      </div>
    </div>
  );
}
