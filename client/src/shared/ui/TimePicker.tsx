import { useState } from "react";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface TimePickerProps {
  value: string; // "HH:MM"
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad(i));

/** Chiroyli soat:daqiqa tanlagich (native input o'rniga). */
export function TimePicker({ value, onChange, placeholder = "Vaqt tanlang", className = "" }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [h, m] = value ? value.split(":") : ["", ""];

  const set = (nh: string, nm: string) => onChange(`${nh}:${nm}`);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`w-full h-10 inline-flex items-center gap-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`}
        >
          <Clock size={14} className="text-slate-400 shrink-0" />
          <span className={value ? "font-semibold text-slate-800 tabular-nums" : "text-slate-400"}>{value || placeholder}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-40 p-0 rounded-xl border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="grid grid-cols-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
          <div className="py-2">Soat</div>
          <div className="py-2 border-l border-slate-100">Daqiqa</div>
        </div>
        <div className="grid grid-cols-2" style={{ height: 200 }}>
          <div className="overflow-y-auto py-1">
            {HOURS.map((hh) => (
              <button
                key={hh}
                type="button"
                onClick={() => set(hh, m || "00")}
                className={`w-full px-3 py-1.5 text-sm tabular-nums text-center transition-colors ${hh === h ? "bg-primary text-white font-bold" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {hh}
              </button>
            ))}
          </div>
          <div className="overflow-y-auto py-1 border-l border-slate-100">
            {MINUTES.map((mm) => (
              <button
                key={mm}
                type="button"
                onClick={() => set(h || "00", mm)}
                className={`w-full px-3 py-1.5 text-sm tabular-nums text-center transition-colors ${mm === m ? "bg-primary text-white font-bold" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {mm}
              </button>
            ))}
          </div>
        </div>
        {value && (
          <div className="border-t border-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-slate-50 py-2 rounded-lg transition-colors"
            >
              Tozalash
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
