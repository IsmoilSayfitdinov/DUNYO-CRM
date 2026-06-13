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
      className={`bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-5 flex flex-col gap-2.5 sm:gap-3.5 hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${onClick ? "cursor-pointer" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon size={18} className="sm:hidden text-primary" />
          <Icon size={20} className="hidden sm:block text-primary" />
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
      <div>
        <AnimatedNumber value={value} className="block text-lg sm:text-2xl font-bold text-slate-900 tracking-tight mb-0.5" />
        <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</div>
        {sub && <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-medium italic hidden sm:block">{sub}</div>}
      </div>
    </motion.div>
  );
}
