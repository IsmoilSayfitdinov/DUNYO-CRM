import { Zap, Bell } from "lucide-react";
import { AlertCard } from "./AlertCard";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/skeleton";
import type { DashboardAlert } from "@/modules/dashboard";

const ALERT_TITLE: Record<string, string> = {
  absent: "Kelmagan xodim",
  late: "Kechikish",
  duplicate: "QR kod dublikati",
  pending_leave: "Kutilayotgan ta'til",
  leave: "Ta'til so'rovi",
  payroll: "Ish haqi",
  unpaid: "To'lanmagan maosh",
};

export function SmartAlerts({ alerts }: { alerts?: DashboardAlert[] }) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-5">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Zap size={16} className="text-amber-500" />
        <h3 className="text-sm sm:text-base font-bold text-slate-900">Aqlli ogohlantirishlar</h3>
      </div>
      {alerts === undefined ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState
          size="sm"
          icon={Bell}
          title="Ogohlantirishlar yo'q"
          description="Hozircha hech qanday aqlli ogohlantirish mavjud emas."
        />
      ) : (
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 -mr-1">
          {alerts.map((a, i) => (
            <AlertCard
              key={i}
              severity={a.severity}
              title={ALERT_TITLE[a.type] ?? a.type}
              desc={a.message}
            />
          ))}
        </div>
      )}
    </div>
  );
}
