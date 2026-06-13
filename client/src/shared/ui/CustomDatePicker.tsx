"use client";

import * as React from "react";
import { format, isSameDay } from "date-fns";
import { uz } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/shared/lib/utils";
import { Button } from "./button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

interface CustomDatePickerProps {
  mode?: "single" | "range";
  value?: Date | DateRange;
  onChange?: (date: any) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomDatePicker({
  mode = "single",
  value,
  onChange,
  placeholder = "Sana tanlang",
  label,
  className,
  disabled
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const presets = [
    { label: "Bugun", getValue: () => new Date() },
    { label: "Kecha", getValue: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
    }},
    { label: "Oxirgi 7 kun", mode: "range" as const, getValue: () => ({
      from: new Date(new Date().setDate(new Date().getDate() - 7)),
      to: new Date()
    })},
    { label: "Shu oy", mode: "range" as const, getValue: () => ({
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date()
    })},
    { label: "O'tgan oy", mode: "range" as const, getValue: () => ({
      from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
      to: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
    })},
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
    onChange?.(preset.getValue());
    if (mode === "single") setIsOpen(false);
  };

  const displayText = React.useMemo(() => {
    if (!value) return placeholder;
    
    if (mode === "single" && value instanceof Date) {
      return format(value, "d MMMM, yyyy", { locale: uz });
    }
    
    if (mode === "range" && (value as DateRange)?.from) {
      const range = value as DateRange;
      const from = range.from!;
      if (range.to) {
        if (from.getMonth() === range.to.getMonth() && from.getFullYear() === range.to.getFullYear()) {
          return `${format(from, "d")} - ${format(range.to, "d MMMM, yyyy", { locale: uz })}`;
        }
        return `${format(from, "d MMM", { locale: uz })} - ${format(range.to, "d MMM, yyyy", { locale: uz })}`;
      }
      return format(from, "d MMMM, yyyy", { locale: uz });
    }
    
    return placeholder;
  }, [value, mode, placeholder]);

  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-700 ml-1 flex items-center gap-1.5">
          {label}
        </label>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "w-full h-11 justify-start text-left font-medium rounded-xl border-slate-200 bg-white hover:bg-slate-50 dark:bg-white dark:border-slate-200 dark:hover:bg-slate-100 transition-all focus:ring-4 focus:ring-ring/10 shadow-sm",
              !value && "text-slate-400"
            )}
          >
            <CalendarIcon className="mr-2.5 h-4 w-4 text-primary stroke-[2.5px]" />
            <span className="truncate">{displayText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 rounded-2xl border-slate-200 dark:border-slate-200 bg-white dark:bg-slate-50 shadow-2xl overflow-x-hidden max-h-[min(85vh,640px)] overflow-y-auto"
          align="start"
          sideOffset={8}
        >
          <div className="flex flex-col md:flex-row min-h-[340px]">
            <div className="p-3 w-full md:w-44 bg-slate-50/50 dark:bg-white/50 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-200 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 px-3 py-2">
                Tezkor tanlov
              </span>
              {presets.filter(p => !p.mode || p.mode === mode).map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className="shrink-0 whitespace-nowrap text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white hover:text-primary dark:hover:bg-slate-100 dark:hover:text-primary hover:shadow-sm transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            
            <div className="p-4">
              <DayPicker
                mode={mode as any}
                selected={value as any}
                onSelect={onChange}
                locale={uz}
                className="p-0"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center px-10",
                  caption_label: "text-sm font-bold text-slate-800 dark:text-slate-200",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                    "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity border border-slate-200 dark:border-slate-200 rounded-lg flex items-center justify-center"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-slate-400 rounded-md w-9 font-medium text-[11px] uppercase tracking-wider",
                  row: "flex w-full mt-2",
                  cell: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-slate-100 dark:[&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg",
                    mode === "range" ? "[&:has([aria-selected].day-range-end)]:rounded-r-lg [&:has([aria-selected].day-range-start)]:rounded-l-lg" : "[&:has([aria-selected])]:rounded-lg"
                  ),
                  day: cn(
                    "h-9 w-9 p-0 font-medium aria-selected:opacity-100 rounded-lg transition-all hover:bg-primary/10 dark:hover:bg-primary/10"
                  ),
                  day_range_start: "day-range-start bg-primary text-white hover:bg-primary/90 hover:text-white rounded-lg",
                  day_range_end: "day-range-end bg-primary text-white hover:bg-primary/90 hover:text-white rounded-lg",
                  day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-primary dark:aria-selected:bg-slate-800 dark:aria-selected:text-primary",
                  day_selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
                  day_today: "bg-slate-100 dark:bg-slate-100 text-primary font-bold",
                  day_outside: "text-slate-600 opacity-50 dark:text-slate-600",
                  day_disabled: "text-slate-600 opacity-50 dark:text-slate-600",
                  day_hidden: "invisible",
                }}
                components={{
                  IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                  IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
                }}
              />
              
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-200">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    onChange?.(undefined);
                    if (mode === "single") setIsOpen(false);
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  Tozalash
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost"
                    size="sm" 
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400"
                  >
                    Bekor qilish
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setIsOpen(false)}
                    className="bg-primary hover:bg-primary/90 text-white rounded-xl px-5 text-xs font-bold shadow-md shadow-primary/20 dark:shadow-none transition-all active:scale-95"
                  >
                    Tayyor
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default CustomDatePicker;
