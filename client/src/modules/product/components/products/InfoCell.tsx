import React from "react";

export function InfoCell({
  icon,
  label,
  value,
  highlight,
  warn,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-xl border ${
        highlight
          ? "bg-primary/5 border-primary/10"
          : warn
          ? "bg-destructive/5 border-destructive/10"
          : "bg-slate-50 border-slate-100"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold mb-1 ${
          highlight ? "text-primary" : warn ? "text-destructive" : "text-slate-400"
        }`}
      >
        {icon} {label}
      </div>
      <p
        className={`text-sm font-bold truncate ${
          warn ? "text-destructive" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
