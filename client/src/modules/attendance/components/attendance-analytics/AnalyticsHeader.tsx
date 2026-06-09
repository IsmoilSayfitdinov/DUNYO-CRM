import { Filter, Download } from "lucide-react";

export function AnalyticsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">{"Davomat tahlili"}</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{"Davomat tendentsiyalari va intizom bo'yicha batafsil ma'lumotlar"}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 text-sm bg-white border border-slate-200 rounded-lg h-11 px-4 text-slate-600 hover:bg-slate-50">
          <Filter size={14} /> {"Filtrlar"}
        </button>
        <button className="flex items-center gap-2 text-sm bg-white border border-slate-200 rounded-lg h-11 px-4 text-slate-600 hover:bg-slate-50">
          <Download size={14} /> {"Eksport"}
        </button>
      </div>
    </div>
  );
}
