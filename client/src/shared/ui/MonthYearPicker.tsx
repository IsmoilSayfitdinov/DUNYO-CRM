import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const MONTHS_UZ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

interface MonthYearPickerProps {
  year: number;
  month: number; // 1–12
  onChange: (value: { year: number; month: number }) => void;
  className?: string;
}

/** Faqat OY va YIL tanlash uchun (kun emas). */
export function MonthYearPicker({ year, month, onChange, className = "" }: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(year);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setViewYear(year);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`h-11 inline-flex items-center gap-2 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 shadow-sm transition-all ${className}`}
        >
          <Calendar size={15} className="text-primary" />
          <span className="capitalize">{MONTHS_UZ[month - 1]} {year}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-64 p-3 rounded-2xl border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={() => setViewYear((y) => y - 1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-bold text-slate-800">{viewYear}</span>
          <button type="button" onClick={() => setViewYear((y) => y + 1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MONTHS_UZ.map((m, i) => {
            const active = viewYear === year && i + 1 === month;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  onChange({ year: viewYear, month: i + 1 });
                  setOpen(false);
                }}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${active ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {m.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
