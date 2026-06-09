import { Check, X, ClipboardList } from "lucide-react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { EmptyState } from "@/shared/ui/EmptyState";

export function LeaveRequestCards({ requests, onApprove, onReject }: any) {
  return (
    <div className="md:hidden divide-y divide-slate-100">
      {requests.length === 0 ? (
        <EmptyState
          size="sm"
          icon={ClipboardList}
          title="So'rovlar topilmadi"
          description="Ushbu filtr bo'yicha hech qanday ta'til so'rovlari mavjud emas."
        />
      ) : (
        requests.map((req: any) => (
          <div key={req.id} className="p-3 sm:p-4 space-y-3">
            {/* Top row: employee + status + actions */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                  style={{ background: `hsl(${(req.employeeId * 15) % 40}, 70%, 55%)` }}
                >
                  {req.employee.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{req.employee}</div>
                  <div className="text-xs text-slate-400">{req.type}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={req.status as any} />
                {req.status === "Pending" && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onApprove(req.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success border border-success/20"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => onReject(req.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Details row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>{req.from} – {req.to}</span>
              <span className="font-semibold text-slate-700">{req.days} kun</span>
              <span>{req.submittedAt}</span>
            </div>
            {req.reason && (
              <p className="text-xs text-slate-400 line-clamp-2">{req.reason}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
