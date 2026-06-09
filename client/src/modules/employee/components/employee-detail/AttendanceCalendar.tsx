import { getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MonthYearPicker } from "@/shared/ui/MonthYearPicker";
import { attendanceCalColor } from "@/shared/utils";

const pad = (n: number) => String(n).padStart(2, "0");

interface AttRow { work_date: string; status: string; badge: string; checkIn: string }
interface Period { year: number; month: number }

interface Props {
  period: Period;
  onPeriodChange: (p: Period) => void;
  attRows: AttRow[];
}

export function AttendanceCalendar({ period, onPeriodChange, attRows }: Props) {
  const year = period.year;
  const month = period.month - 1; // 0-indexed
  const monthDate = new Date(year, month, 1);
  // work_date'ning faqat sana qismi bo'yicha indekslaymiz — backend datetime qaytarsa ham mos keladi.
  const byDate = new Map(attRows.map((r) => [r.work_date.slice(0, 10), r]));
  const daysInMonth = getDaysInMonth(monthDate);
  const firstWeekday = (getDay(startOfMonth(monthDate)) + 6) % 7; // dushanba = 0

  // Oy/yilni siljitish — yil chegarasidan o'tganda Date avtomatik to'g'irlaydi.
  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    onPeriodChange({ year: d.getFullYear(), month: d.getMonth() + 1 });
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const legend = [
    { l: "Kelgan", c: "bg-success" },
    { l: "Kechikkan", c: "bg-warning" },
    { l: "Kelmagan", c: "bg-destructive" },
    { l: "Ta'til", c: "bg-blue-500" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">Davomat kalendari</h3>
          <p className="text-xs text-slate-400">Oylik vizual ko'rinish — kunlar holati bo'yicha</p>
        </div>

        {/* Oy/yil navigatsiyasi: ‹ strelka + tanlagich + › strelka */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Oldingi oy"
            className="shrink-0 w-11 h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-sm transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <MonthYearPicker
            year={period.year}
            month={period.month}
            onChange={onPeriodChange}
            className="flex-1 sm:flex-none justify-center"
          />
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Keyingi oy"
            className="shrink-0 w-11 h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-sm transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-3">
        {legend.map((x) => (
          <div key={x.l} className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className={`w-2.5 h-2.5 rounded ${x.c}`} /> {x.l}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1 uppercase tracking-wider">{d}</div>
        ))}
        {Array.from({ length: firstWeekday }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const rec = byDate.get(`${year}-${pad(month + 1)}-${pad(day)}`);
          return (
            <div
              key={day}
              title={rec ? rec.badge : ""}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all ${attendanceCalColor(rec?.status)} ${isToday(day) ? "ring-2 ring-primary ring-offset-1" : ""}`}
            >
              <span>{day}</span>
              {rec?.checkIn && <span className="text-[8px] opacity-80 leading-none mt-0.5">{rec.checkIn}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
