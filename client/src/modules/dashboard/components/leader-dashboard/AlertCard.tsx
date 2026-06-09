const ALERT_CFG: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  danger:   { bg: "bg-red-50/60",   border: "border-red-100",   text: "text-red-700",   dot: "bg-red-500" },
  critical: { bg: "bg-red-50/60",   border: "border-red-100",   text: "text-red-700",   dot: "bg-red-500" },
  warning:  { bg: "bg-amber-50/60", border: "border-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  info:     { bg: "bg-blue-50/60",  border: "border-blue-100",  text: "text-blue-700",  dot: "bg-blue-500" },
};

export function AlertCard({ severity, title, desc }: { severity: string; title: string; desc: string }) {
  // Noma'lum severity'da ham crash bo'lmasligi uchun fallback
  const cfg = ALERT_CFG[severity] ?? ALERT_CFG.info;
  return (
    <div className={`${cfg.bg} border ${cfg.border} rounded-xl p-4 flex gap-3.5 transition-all hover:bg-white hover:shadow-sm`}>
      <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} mt-1.5 shrink-0`} />
      <div>
        <div className={`text-sm font-bold ${cfg.text}`}>{title}</div>
        <div className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}
