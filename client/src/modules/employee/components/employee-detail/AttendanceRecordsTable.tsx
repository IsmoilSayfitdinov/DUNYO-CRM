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
      <div className="overflow-x-auto">
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
