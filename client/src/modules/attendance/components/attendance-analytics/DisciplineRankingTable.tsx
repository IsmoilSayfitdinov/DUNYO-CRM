import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";

const hue = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

export function DisciplineRankingTable({
  totalCount,
  paginated,
  filtered,
  page,
  totalPages,
  pageSize,
  onPrev,
  onNext,
}: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-3 sm:px-5 py-4 border-b border-slate-200/50">
        <h3 className="font-semibold text-slate-900">Xodimlarning intizom reytingi</h3>
        <span className="text-xs text-slate-400">{totalCount} ta xodim</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              {["Daraja", "Xodim", "Lavozim", "Davomat %", "Ball"].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50">
            {paginated.length > 0 ? (
              paginated.map((emp: any, i: number) => (
                <tr key={emp.employee_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 sm:px-5 py-3.5 text-sm font-semibold text-slate-400">#{(page - 1) * pageSize + i + 1}</td>
                  <td className="px-3 sm:px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                        style={{ background: `hsl(${hue(emp.employee_id)}, 65%, 55%)` }}
                      >
                        {emp.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="text-sm font-medium text-slate-800 truncate">{emp.name}</div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{emp.position || "—"}</td>
                  <td className="px-3 sm:px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full">
                        <div className="h-full rounded-full bg-success" style={{ width: `${emp.attendancePct}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{emp.attendancePct}%</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-3.5">
                    <span className={`text-sm font-semibold ${emp.score >= 90 ? "text-success" : emp.score >= 80 ? "text-warning" : "text-destructive"}`}>
                      {emp.score}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    size="sm"
                    icon={ClipboardList}
                    title="Yozuvlar topilmadi"
                    description="Filtrga mos keladigan xodimlarning intizom reytingi mavjud emas."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-3 border-t border-slate-200/50 bg-slate-50">
        <span className="text-xs text-slate-400 min-w-0 truncate">
          {filtered.length > 0 ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} tasini ko'rsatmoqda, jami {filtered.length} tadan
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button disabled={page === 1} onClick={onPrev} className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white disabled:opacity-40 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button disabled={page === totalPages} onClick={onNext} className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white disabled:opacity-40 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
