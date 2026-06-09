import { Activity } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { activityIcon } from "./constants";
import type { DashboardActivity } from "@/modules/dashboard";

const relTime = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "hozir";
  if (diff < 3600) return `${Math.floor(diff / 60)} daq oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  return `${Math.floor(diff / 86400)} kun oldin`;
};

export function ActivityFeed({ activity }: { activity?: DashboardActivity[] }) {
  const list = activity ?? [];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Oxirgi harakatlar</h3>
      </div>
      {list.length === 0 ? (
        <EmptyState size="sm" icon={Activity} title="Harakatlar yo'q" description="Hozircha hech qanday harakat qayd etilmagan." />
      ) : (
        <div className="space-y-3">
          {list.slice(0, 8).map((item, i) => {
            const cfg = activityIcon[item.type] || activityIcon.checkin;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: cfg.bg }}>
                  <Activity size={12} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 leading-snug">
                    <span className="font-medium text-gray-800">{item.employee_name}</span> {item.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{relTime(item.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
