import type { ReactNode } from "react";
import { Inbox, type LucideIcon, Loader2, AlertTriangle } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: "default" | "error" | "loading";
  size?: "sm" | "md";
  className?: string;
}

const TONE = {
  default: { ring: "from-slate-50 to-slate-100 border-slate-200", glow: "bg-primary/10", icon: "text-slate-400" },
  error: { ring: "from-red-50 to-rose-100 border-red-200", glow: "bg-destructive/10", icon: "text-destructive" },
  loading: { ring: "from-primary/5 to-primary/10 border-primary/15", glow: "bg-primary/10", icon: "text-primary" },
};

const SIZE = {
  sm: { pad: "py-8 px-4", box: "w-12 h-12 rounded-xl", icon: 22, title: "text-sm", desc: "text-xs max-w-xs" },
  md: { pad: "py-14 px-6", box: "w-16 h-16 rounded-2xl", icon: 28, title: "text-base", desc: "text-sm max-w-sm" },
};

/**
 * Ma'lumot bo'lmaganda / yuklanayotganda / xatoda ko'rsatiladigan chiroyli holat.
 */
export function EmptyState({ icon, title, description, action, variant = "default", size = "md", className = "" }: EmptyStateProps) {
  const tone = TONE[variant];
  const sz = SIZE[size];
  const Icon = icon ?? (variant === "error" ? AlertTriangle : variant === "loading" ? Loader2 : Inbox);

  return (
    <div className={`flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300 ${sz.pad} ${className}`}>
      <div className="relative mb-4">
        <div className={`absolute inset-0 ${tone.glow} blur-2xl rounded-full`} />
        <div className={`relative ${sz.box} bg-gradient-to-br ${tone.ring} border flex items-center justify-center shadow-sm`}>
          <Icon size={sz.icon} className={`${tone.icon} ${variant === "loading" ? "animate-spin" : ""}`} />
        </div>
      </div>
      <h3 className={`${sz.title} font-semibold text-slate-700`}>{title}</h3>
      {description && <p className={`${sz.desc} text-slate-400 mt-1.5 leading-relaxed`}>{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
