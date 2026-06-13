import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/skeleton";

interface AtRiskItem {
  employee_id: string;
  name: string;
  score: number;
  attendancePct: number;
}

export function AtRiskEmployees({ atRisk }: { atRisk?: AtRiskItem[] }) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">E'tibor talab etiladi</h3>
        <AlertTriangle size={15} className="text-amber-500" />
      </div>
      {atRisk === undefined ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : atRisk.length === 0 ? (
        <EmptyState
          size="sm"
          icon={CheckCircle2}
          title="Hammasi joyida"
          description="Hozircha e'tibor talab etadigan xodimlar yo'q."
        />
      ) : (
        <div className="space-y-3">
          {atRisk.map((emp) => (
            <div key={emp.employee_id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 bg-slate-400">
                {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{emp.name}</div>
                <div className="text-xs text-slate-400">{emp.attendancePct}% davomat · Ball {emp.score}</div>
              </div>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                Past ball
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
