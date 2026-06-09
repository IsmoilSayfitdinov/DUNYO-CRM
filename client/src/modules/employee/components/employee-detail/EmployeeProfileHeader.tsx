import { Phone, Calendar, Clock, Pencil, UserMinus, UserCheck, DollarSign, Award, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { ScoreRing } from "@/shared/ui/ScoreRing";
import { formatSom } from "@/shared/utils";
import type { Employee } from "../../types";
import type { SalaryHistory } from "@/modules/salary";

const hueFromId = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

interface Props {
  emp: Employee;
  onEdit: () => void;
  onToggleActive: (next: boolean) => void;
  isToggling?: boolean;
  /** Tanlangan oy uchun ish haqi yozuvi (yo'q bo'lsa — hali hisoblanmagan). */
  periodSalary?: SalaryHistory;
  /** "YYYY-MM" — tugma ostidagi oy belgisi. */
  periodLabel?: string;
  /** Oylik hisoblash faqat oy tugagandan keyin (joriy/kelajak oyda emas). */
  canCalculate?: boolean;
  onCalculateSalary: () => void;
  onPaySalary: () => void;
  isCalculating?: boolean;
  isPaying?: boolean;
}

export function EmployeeProfileHeader({
  emp, onEdit, onToggleActive, isToggling,
  periodSalary, periodLabel, canCalculate, onCalculateSalary, onPaySalary, isCalculating, isPaying,
}: Props) {
  const fullName = `${emp.user.first_name} ${emp.user.last_name}`.trim() || emp.user.username;
  const color = `hsl(${hueFromId(emp.id)}, 65%, 55%)`;
  const shift = `${(emp.shift_start || "").slice(0, 5)}–${(emp.shift_end || "").slice(0, 5)}`;
  const joinDate = (emp.created_at || "").slice(0, 10);

  const pills = [
    { icon: Phone, label: "Telefon", value: emp.user.phone || "—", color: "var(--primary)" },
    { icon: Clock, label: "Smena", value: shift || "—", color: "var(--warning)" },
    { icon: DollarSign, label: "Soatlik stavka", value: formatSom(emp.hourly_rate), color: "var(--success)" },
    { icon: Calendar, label: "Qo'shilgan", value: joinDate || "—", color: "#6366f1" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative shrink-0 self-start sm:self-auto">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md" style={{ background: color }}>
            {fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${emp.is_active ? "bg-success" : "bg-slate-300"}`} title={emp.is_active ? "Faol" : "Nofaol"} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{fullName}</h1>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${emp.is_active ? "bg-success/10 text-success border border-success/20" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
              {emp.is_active ? "Faol" : "Nofaol"}
            </span>
            {emp.score >= 90 && <span className="inline-flex items-center gap-1 text-[10px] bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"><Award size={11} /> Eng yaxshi</span>}
            {emp.score < 80 && <span className="inline-flex items-center gap-1 text-[10px] bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"><AlertTriangle size={11} /> Xavf ostida</span>}
          </div>
          <p className="text-slate-400 text-sm mt-1 truncate">{emp.position} · @{emp.user.username}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ScoreRing score={emp.score} size={60} showLabel />
          <div className="flex flex-col gap-2">
            <button onClick={onEdit} className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
              <Pencil size={14} /> Tahrirlash
            </button>
            {/* Oylik holati: (oy tugasa) Hisoblash → To'lash → To'langan */}
            {!periodSalary ? (
              canCalculate ? (
                <button
                  onClick={onCalculateSalary}
                  disabled={isCalculating}
                  title={periodLabel ? `${periodLabel} oyi uchun hisoblash` : undefined}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-green-500/15 border border-green-500/60 rounded-xl text-green-700 hover:bg-green-500/25 shadow-sm transition-all disabled:opacity-60"
                >
                  {isCalculating ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
                  {isCalculating ? "Hisoblanmoqda…" : "Oylik Hisoblash"}
                </button>
              ) : (
                <div
                  title="Ish haqi faqat oy tugagandan keyin hisoblanadi"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-400 cursor-default"
                >
                  <Clock size={14} /> Oy yakunlanmagan
                </div>
              )
            ) : periodSalary.is_paid ? (
              <div
                title={periodSalary.paid_at ? `To'langan: ${periodSalary.paid_at.slice(0, 10)}` : undefined}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-500/15 border border-emerald-500/60 rounded-xl text-emerald-700 cursor-default"
              >
                <CheckCircle size={14} /> To'langan
              </div>
            ) : (
              <button
                onClick={onPaySalary}
                disabled={isPaying}
                title={periodLabel ? `${periodLabel} oyi uchun to'lash` : undefined}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-primary/15 border border-primary/60 rounded-xl text-primary hover:bg-primary/25 shadow-sm transition-all disabled:opacity-60"
              >
                {isPaying ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
                {isPaying ? "To'lanmoqda…" : "To'lash"}
              </button>
            )}
            {emp.is_active ? (
              <button onClick={() => onToggleActive(false)} disabled={isToggling}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-white border border-amber-200 rounded-xl text-amber-600 hover:bg-amber-50 shadow-sm transition-all disabled:opacity-60">
                <UserMinus size={14} /> Faolsizlantirish
              </button>
            ) : (
              <button onClick={() => onToggleActive(true)} disabled={isToggling}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-white border border-emerald-200 rounded-xl text-emerald-600 hover:bg-emerald-50 shadow-sm transition-all disabled:opacity-60">
                <UserCheck size={14} /> Faollashtirish
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
        {pills.map((it) => (
          <div key={it.label} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${it.color}, transparent 88%)` }}>
              <it.icon size={16} style={{ color: it.color }} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{it.label}</div>
              <div className="text-sm font-semibold text-slate-700 truncate">{it.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
