import CustomSelect from "@/shared/ui/CustomSelect";

export function DashboardHeader({ dateOptions, dateRange, setDateRange }: any) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">Umumiy boshqaruv paneli</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{new Date().toLocaleDateString("uz-UZ", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · Real vaqtdagi ma'lumotlar</p>
      </div>
      <div className="w-full md:w-auto">
        <CustomSelect
          options={dateOptions}
          value={dateRange}
          onValueChange={setDateRange}
          className="w-full md:w-48"
          searchable={false}
        />
      </div>
    </div>
  );
}
