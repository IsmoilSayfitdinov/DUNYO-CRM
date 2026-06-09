import { Plus, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { ScoreRing } from "@/shared/ui/ScoreRing";
import { EmptyState } from "@/shared/ui/EmptyState";
import { RowMenu } from "./RowMenu";

export function EmployeeTable({
  isLoading,
  isError,
  paginated,
  filtered,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onAdd,
  onView,
  onEdit,
  onToggleActive,
  onDelete,
}: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3">Xodim</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3 hidden sm:table-cell">Lavozim</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3 hidden md:table-cell">Filial</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3 hidden lg:table-cell">Smena</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3">Stavka</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3 hidden md:table-cell">Ball</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3">Holat</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50">
            {isLoading ? (
              <tr><td colSpan={8}><EmptyState variant="loading" title="Yuklanmoqda…" description="Xodimlar serverdan olinmoqda" /></td></tr>
            ) : isError ? (
              <tr><td colSpan={8}><EmptyState variant="error" title="Yuklab bo'lmadi" description="Server bilan bog'lanishda xatolik. Backend ishlayaptimi?" /></td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={8}>
                <EmptyState
                  icon={Users}
                  title="Xodimlar topilmadi"
                  description="Qidiruv yoki filtrni o'zgartiring, yoki yangi xodim qo'shing."
                  action={
                    <button onClick={onAdd}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                      <Plus size={16} /> Xodim qo'shish
                    </button>
                  }
                />
              </td></tr>
            ) : (
              paginated.map((emp: any, i: number) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-3 sm:px-5 py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-semibold shrink-0"
                        style={{ background: `hsl(${(((page - 1) * pageSize + i) * 53) % 360}, 65%, 55%)` }}>
                        {emp.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-slate-800 truncate">{emp.name}</div>
                        <div className="text-[10px] sm:text-xs text-slate-400 truncate">@{emp.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-3 hidden sm:table-cell">
                    <div className="text-sm text-slate-700">{emp.position}</div>
                  </td>
                  <td className="px-3 sm:px-5 py-3 hidden md:table-cell">
                    {emp.branch && emp.branch !== "—" ? (
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">{emp.branch}</span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-5 py-3 text-sm text-slate-400 hidden lg:table-cell">{emp.shift}</td>
                  <td className="px-3 sm:px-5 py-3 text-xs sm:text-sm font-medium text-slate-800">{emp.hourlyRate.toLocaleString()} <span className="text-slate-400 font-normal">/soat</span></td>
                  <td className="px-3 sm:px-5 py-3 hidden md:table-cell"><ScoreRing score={emp.score} size={44} /></td>
                  <td className="px-3 sm:px-5 py-3">
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider ${emp.isActive ? "bg-success/10 text-success border border-success/20" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                      {emp.isActive ? "Faol" : "Nofaol"}
                    </span>
                  </td>
                  <td className="px-3 sm:px-5 py-3">
                    <RowMenu
                      isActive={emp.isActive}
                      onView={() => onView(emp)}
                      onEdit={() => onEdit(emp)}
                      onToggleActive={() => onToggleActive(emp)}
                      onDelete={() => onDelete(emp)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-2.5 sm:py-3 border-t border-slate-200/50 bg-slate-50">
        <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:inline">
          {filtered.length > 0 ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} / {filtered.length}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-1.5 w-full sm:w-auto">
          <button disabled={page === 1} onClick={() => onPageChange(page - 1)}
            className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white transition-all disabled:opacity-40">
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => onPageChange(p)}
              className={`w-10 h-10 rounded-lg text-xs font-medium transition-all ${p === page ? "bg-primary text-primary-foreground" : "border border-slate-200 text-slate-400 hover:bg-white"}`}>
              {p}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)}
            className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white transition-all disabled:opacity-40">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
