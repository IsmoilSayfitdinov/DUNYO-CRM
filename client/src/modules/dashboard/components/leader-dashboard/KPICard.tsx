import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AnimatedNumber } from "@/shared/ui/AnimatedNumber";

export function KPICard({
  label, value, sub, icon: Icon, trend, trendDir, onClick
}: {
  label: string; value: string; sub?: string; icon: React.ElementType;
  trend?: string; trendDir?: "up" | "down" | "neutral";
  onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      whileHover={onClick ? { y: -3 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-5
        flex flex-row items-center gap-3
        sm:flex-col sm:items-stretch sm:gap-3.5
        hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${onClick ? "cursor-pointer" : ""}`}>
      {/* Ikonka + (PC'da) trend bir qatorda. Mobilda ikonka chapda turadi. */}
      <div className="flex items-start justify-between shrink-0 sm:w-full">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon size={20} className="text-primary" />
        </div>
        {trend && (
          <div className={`hidden sm:flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-lg ${
            trendDir === "up" ? "bg-emerald-50 text-emerald-600" : trendDir === "down" ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400"
          }`}>
            {trendDir === "up" ? <TrendingUp size={12} /> : trendDir === "down" ? <TrendingDown size={12} /> : null}
            {trend}
          </div>
        )}
      </div>
      {/* Matn bloki — mobilda ikonka yonida (o'ngда), PC'da ostida */}
      <div className="min-w-0 flex-1">
        <AnimatedNumber value={value} className="block text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-0.5 leading-none" />
        <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide sm:tracking-widest leading-tight">{label}</div>
        {sub && <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-medium italic hidden sm:block">{sub}</div>}
      </div>
    </motion.div>
  );
}
