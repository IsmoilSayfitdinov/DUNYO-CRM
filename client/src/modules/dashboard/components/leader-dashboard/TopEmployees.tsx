import { Users } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/skeleton";

const AVATAR_BG = ["bg-primary", "bg-green-600", "bg-amber-600", "bg-blue-600", "bg-purple-600"];

export function TopEmployees({ topEmployees }: any) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-900">Eng yaxshi xodimlar</h3>
        <span className="text-[10px] sm:text-xs text-slate-400">Intizom balli</span>
      </div>
      <div className="space-y-3">
        {topEmployees === undefined ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </>
        ) : topEmployees.length === 0 ? (
          <EmptyState
            size="sm"
            icon={Users}
            title="Xodimlar yo'q"
            description="Hozircha intizom balli bo'yicha eng yaxshi xodimlar ma'lumoti mavjud emas."
          />
        ) : topEmployees.map((emp: any, i: number) => (
          <div key={emp.employee_id} className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 w-4">{i + 1}</span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${AVATAR_BG[i % AVATAR_BG.length]}`}
            >
              {emp.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-800 truncate">{emp.name}</div>
              <div className="text-xs text-slate-400 truncate">{emp.position || "—"}</div>
            </div>
            <div className="text-sm font-semibold text-slate-900">{emp.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
