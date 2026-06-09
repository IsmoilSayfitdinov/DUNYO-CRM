import { Users } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";

export function TopEmployees({ topEmployees }: any) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-bold text-gray-900">Eng yaxshi xodimlar</h3>
        <span className="text-[10px] sm:text-xs text-gray-400">Intizom balli</span>
      </div>
      <div className="space-y-3">
        {topEmployees.length === 0 ? (
          <EmptyState
            size="sm"
            icon={Users}
            title="Xodimlar yo'q"
            description="Hozircha intizom balli bo'yicha eng yaxshi xodimlar ma'lumoti mavjud emas."
          />
        ) : topEmployees.map((emp: any, i: number) => (
          <div key={emp.employee_id} className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400 w-4">{i + 1}</span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
              style={{ background: ["#dc2626","#16a34a","#d97706","#2563eb","#9333ea"][i % 5] }}
            >
              {emp.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">{emp.name}</div>
              <div className="text-xs text-gray-400 truncate">{emp.position || "—"}</div>
            </div>
            <div className="text-sm font-semibold text-gray-900">{emp.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
