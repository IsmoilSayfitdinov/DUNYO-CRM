import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { Calendar, PenLine } from "lucide-react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { EmptyState } from "@/shared/ui/EmptyState";

interface AttRow {
  id: string; date: string; checkIn: string; checkOut: string; badge: string; duration: string; earned: number;
}

interface Props {
  attRows: AttRow[];
  monthDate: Date;
  onEditRecord: (row: AttRow) => void;
}

export function AttendanceRecordsTable({ attRows, monthDate, onEditRecord }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200/50">
        <h3 className="font-semibold text-slate-900">Davomat yozuvlari <span className="text-slate-400 font-normal capitalize">· {format(monthDate, "LLLL yyyy", { locale: uz })}</span></h3>
        <p className="text-xs text-slate-400 mt-0.5">Batafsil ro'yxat — kirish/chiqish, davomiylik va tahrirlash</p>
      </div>
      {/* ===== MOBIL: kartalar (<640px) ===== */}
      <div className="sm:hidden divide-y divide-slate-200/60">
        {attRows.length === 0 ? (
          <EmptyState icon={Calendar} title="Davomat yozuvi yo'q" description="Tanlangan oy uchun davomat qaydlari mavjud emas." />
        ) : (
          attRows.map((r) => (
            <div key={r.id} className="p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-800">{r.date}</span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.badge as any} />
                  <button onClick={() => onEditRecord(r)} className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                    <PenLine size={15} />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>↓ {r.checkIn || "—"}</span>
                <span>↑ {r.checkOut || "—"}</span>
                {r.duration && <span>· {r.duration}</span>}
              </div>
              {r.earned > 0 && (
                <div className="mt-1.5 text-sm font-bold text-primary">{r.earned.toLocaleString()} so'm</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ===== DESKTOP: jadval (sm+) ===== */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              {["Sana", "Kirish", "Chiqish", "Davomiylik", "Holati", "Ishlangan summa", "Amal"].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50">
            {attRows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 text-sm text-slate-700 font-medium">{r.date}</td>
                <td className="px-5 py-3 text-sm text-slate-600">{r.checkIn || "—"}</td>
                <td className="px-5 py-3 text-sm text-slate-600">{r.checkOut || "—"}</td>
                <td className="px-5 py-3 text-sm text-slate-600">{r.duration}</td>
                <td className="px-5 py-3"><StatusBadge status={r.badge as any} /></td>
                <td className="px-5 py-3 text-sm font-bold text-primary">{r.earned > 0 ? `${r.earned.toLocaleString()} UZS` : "—"}</td>
                <td className="px-5 py-3">
                  <button onClick={() => onEditRecord(r)} className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                    <PenLine size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {attRows.length === 0 && (
              <tr><td colSpan={7}><EmptyState icon={Calendar} title="Davomat yozuvi yo'q" description="Tanlangan oy uchun davomat qaydlari mavjud emas." /></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
