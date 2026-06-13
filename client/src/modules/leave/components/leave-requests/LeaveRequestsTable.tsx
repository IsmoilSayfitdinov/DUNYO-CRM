import { Check, X, ClipboardList } from "lucide-react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { leaveTypeLabel } from "../../constants/leave-types";

const hue = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

export function LeaveRequestsTable({ requests, onApprove, onReject }: any) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Xodim</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Ta’til turi</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Sana oralig’i</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Kunlar</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 hidden lg:table-cell">Sabab</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 hidden xl:table-cell">Yuborilgan</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Holat</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Amallar</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200/50">
          {requests.length === 0 ? (
            <tr>
              <td colSpan={8}>
                <EmptyState
                  size="sm"
                  icon={ClipboardList}
                  title="So'rovlar topilmadi"
                  description="Hozircha ta'til so'rovlari yo'q yoki tanlangan filtr bo'yicha hech narsa topilmadi."
                />
              </td>
            </tr>
          ) : (
            requests.map((req: any) => (
            <tr
              key={req.id}
              className="transition-colors hover:bg-slate-50"
            >
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{
                      background: `hsl(${hue(req.employee)}, 65%, 55%)`,
                    }}
                  >
                    {req.employee
                      .split(" ")
                      .map((namePart: string) => namePart[0])
                      .join("")}
                  </div>
                  <span className="text-sm font-medium text-slate-800">
                    {req.employee}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3.5 text-sm text-slate-600">
                {leaveTypeLabel(req.type)}
              </td>
              <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                {req.from} – {req.to}
              </td>
              <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">
                {req.days} kun
              </td>
              <td className="max-w-[200px] truncate px-4 py-3.5 text-sm text-slate-400 hidden lg:table-cell">
                {req.reason}
              </td>
              <td className="px-4 py-3.5 text-xs text-slate-400 hidden xl:table-cell whitespace-nowrap">
                {req.submittedAt}
              </td>
              <td className="px-4 py-3.5">
                <StatusBadge status={req.status as any} />
              </td>
              <td className="px-4 py-3.5">
                {req.status === "Pending" ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApprove(req.id)}
                      aria-label="Tasdiqlash"
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success transition-colors hover:bg-success/20 border border-success/20"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => onReject(req.id)}
                      aria-label="Rad etish"
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 border border-destructive/20"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-300">—</span>
                )}
              </td>
            </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
