import { Gift } from "lucide-react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { EmptyState } from "@/shared/ui/EmptyState";

interface Row {
  salaryId: string;
  employeeId: string;
  name: string;
  position: string;
  base: number;
  bonus: number;
  final: number;
  isPaid: boolean;
}

interface Props {
  rows: Row[];
  isLoading?: boolean;
  periodLabel: string;
  onAdjust: (salaryId: string, name: string) => void;
  onMarkPaid: (employeeId: string, salaryId: string) => void;
  isPaying?: boolean;
}

const hue = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
const M = (n: number) => (n / 1_000_000).toFixed(2);

export function PayrollTable({ rows, isLoading, periodLabel, onAdjust, onMarkPaid, isPaying }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-3 sm:px-5 py-4 border-b border-slate-200/50">
        <h3 className="font-semibold text-slate-900">Ish haqini taqsimlash jadvali</h3>
        <span className="text-xs text-slate-400">{periodLabel}</span>
      </div>

      {isLoading ? (
        <EmptyState variant="loading" title="Yuklanmoqda…" description="Ish haqi ma'lumotlari olinmoqda" />
      ) : rows.length === 0 ? (
        <EmptyState title="Ish haqi yo'q" description="Bu oy uchun hisoblangan ish haqi mavjud emas. Avval xodimlarga oylik hisoblang." />
      ) : (
        <>
        {/* ===== MOBIL: kartalar (<640px) ===== */}
        <div className="sm:hidden divide-y divide-slate-200/60">
          {rows.map((r) => (
            <div key={r.salaryId} className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                  style={{ background: `hsl(${hue(r.employeeId)}, 65%, 55%)` }}>
                  {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{r.name}</div>
                  {r.position && <div className="text-xs text-slate-400 truncate">{r.position}</div>}
                </div>
                <StatusBadge status={(r.isPaid ? "Paid" : "Unpaid") as any} />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-lg py-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide">Asosiy</div>
                  <div className="text-sm font-medium text-slate-800 mt-0.5">{M(r.base)}M</div>
                </div>
                <div className="bg-slate-50 rounded-lg py-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide">Premiya</div>
                  <div className="text-sm font-medium text-success mt-0.5">{r.bonus > 0 ? `+${M(r.bonus)}M` : "—"}</div>
                </div>
                <div className="bg-primary/5 rounded-lg py-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide">Jami</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{M(r.final)}M</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onAdjust(r.salaryId, r.name)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[40px] text-xs font-semibold text-success border border-success/20 bg-success/5 rounded-lg hover:bg-success/10 transition-colors"
                >
                  <Gift size={15} /> Premiya
                </button>
                {r.isPaid ? (
                  <span className="flex-1 inline-flex items-center justify-center text-xs bg-slate-100 text-slate-400 min-h-[40px] rounded-lg font-medium">To'langan</span>
                ) : (
                  <button
                    onClick={() => onMarkPaid(r.employeeId, r.salaryId)}
                    disabled={isPaying}
                    className="flex-1 inline-flex items-center justify-center text-xs bg-success text-success-foreground min-h-[40px] rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm disabled:opacity-60"
                  >
                    To'lash
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ===== DESKTOP: jadval (sm+) ===== */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {["Xodim", "Lavozim", "Asosiy", "Premiya", "Jami", "Holat", "Harakat"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {rows.map((r) => (
                <tr key={r.salaryId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 sm:px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                        style={{ background: `hsl(${hue(r.employeeId)}, 65%, 55%)` }}>
                        {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="text-sm font-medium text-slate-800 truncate">{r.name}</div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{r.position || "—"}</td>
                  <td className="px-3 sm:px-5 py-3.5 text-sm font-medium text-slate-800 whitespace-nowrap">{M(r.base)}M</td>
                  <td className="px-3 sm:px-5 py-3.5 text-sm text-success font-medium whitespace-nowrap">{r.bonus > 0 ? `+${M(r.bonus)}M` : "—"}</td>
                  <td className="px-3 sm:px-5 py-3.5 text-sm font-semibold text-slate-900 whitespace-nowrap">{M(r.final)}M <span className="text-[10px] text-slate-400">UZS</span></td>
                  <td className="px-3 sm:px-5 py-3.5"><StatusBadge status={(r.isPaid ? "Paid" : "Unpaid") as any} /></td>
                  <td className="px-3 sm:px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onAdjust(r.salaryId, r.name)}
                        title="Premiya qo'shish"
                        className="w-10 h-10 flex items-center justify-center text-success hover:bg-success/10 rounded-lg transition-colors border border-success/20 shrink-0"
                      >
                        <Gift size={16} />
                      </button>
                      {r.isPaid ? (
                        <span className="text-xs bg-slate-100 text-slate-400 px-3 py-2.5 min-h-[40px] inline-flex items-center rounded-lg font-medium whitespace-nowrap">To'langan</span>
                      ) : (
                        <button
                          onClick={() => onMarkPaid(r.employeeId, r.salaryId)}
                          disabled={isPaying}
                          className="text-xs bg-success text-success-foreground px-3 py-2.5 min-h-[40px] rounded-lg hover:opacity-90 transition-colors font-medium shadow-sm disabled:opacity-60 whitespace-nowrap"
                        >
                          To'lash
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
