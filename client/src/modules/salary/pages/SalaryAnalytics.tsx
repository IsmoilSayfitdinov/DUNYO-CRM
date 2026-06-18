import { useState } from "react";
import { Plus, Award, CreditCard, Wallet } from "lucide-react";
import {
  useSalarySummary,
  useAllSalaries,
  usePaySalary,
  useGiveAdjustment,
  useAdjustments,
  useTeamAdjustments,
  SalaryAdjustmentModal,
} from "@/modules/salary";
import { useEmployees } from "@/modules/employee";
import { ConfirmActionModal } from "@/shared/ui/ConfirmActionModal";
import { CustomSelect } from "@/shared/ui/CustomSelect";
import { EmptyState } from "@/shared/ui/EmptyState";
import {
  SalaryAnalyticsHeader,
  SummaryKpis,
  PayrollTrendChart,
  PaidVsUnpaidPie,
  PayrollTable,
} from "../components/salary-analytics";

const MONTHS_UZ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

export function SalaryAnalytics() {
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const periodLabel = `${MONTHS_UZ[period.month - 1]} ${period.year}`;

  // Real API: oy bo'yicha umumiy hisobot + barcha xodimlar ish haqi
  const { data: summary } = useSalarySummary(period.year, period.month);
  const { data: salaries, isLoading } = useAllSalaries(period.year, period.month, { limit: 100 });

  const paySalary = usePaySalary();
  const giveAdjustment = useGiveAdjustment();
  const { data: employeesData } = useEmployees({ limit: 100 });
  const employees = employeesData?.items ?? [];
  const empName = (e: { user: { first_name: string; last_name: string; username: string } }) =>
    `${e.user.first_name ?? ""} ${e.user.last_name ?? ""}`.trim() || e.user.username;

  const sumPaid = Number(summary?.total_paid ?? 0);
  const sumUnpaid = Number(summary?.total_unpaid ?? 0);
  const sumTotal = sumPaid + sumUnpaid;
  const sumAvg = summary && summary.total > 0 ? sumTotal / summary.total : 0;

  const paidVsUnpaid = [
    { name: "To'langan", value: Number(summary?.paid_count ?? 0), color: "var(--success)" },
    { name: "To'lanmagan", value: Number(summary?.unpaid_count ?? 0), color: "var(--destructive)" },
  ];

  // Real yozuvlarni jadval shakliga o'tkazamiz
  const rows = (salaries ?? []).map((s) => {
    const u = s.employee?.user;
    const name = u ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.username : s.employee_id.slice(0, 8);
    return {
      salaryId: s.id,
      employeeId: s.employee_id,
      name,
      position: s.employee?.position ?? "—",
      base: Number(s.base_salary) || 0,
      bonus: Number(s.bonus) || 0,
      final: Number(s.final_salary) || 0,
      isPaid: s.is_paid,
    };
  });

  const [confirmPay, setConfirmPay] = useState<{ employeeId: string; salaryId: string } | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<{ employeeId: string; name: string } | null>(null);
  const [pickEmployee, setPickEmployee] = useState<string>("");

  // Tanlangan xodimning shu oydagi avans/premiyalari (modalда ko'rinadi)
  const { data: targetAdjustments } = useAdjustments(adjustTarget?.employeeId, period.year, period.month);
  // Butun jamoaning shu oydagi avans/premiyalari (sahifada ko'rinadi)
  const { data: teamAdjustments = [], isLoading: adjLoading } = useTeamAdjustments(period.year, period.month);

  const handleMarkPaid = () => {
    if (!confirmPay) return;
    paySalary.mutate(confirmPay, { onSuccess: () => setConfirmPay(null) });
  };
  const handleAdjustConfirm = (adjustment: { type: "bonus" | "advance"; amount: number; reason: string }) => {
    if (!adjustTarget) return;
    giveAdjustment.mutate(
      {
        employee_id: adjustTarget.employeeId,
        type: adjustment.type,
        amount: adjustment.amount,
        note: adjustment.reason || null,
        year: period.year,
        month: period.month,
      },
      { onSuccess: () => setAdjustTarget(null) },
    );
  };
  const openGiveForPicked = () => {
    const e = employees.find((x) => x.id === pickEmployee);
    if (e) setAdjustTarget({ employeeId: e.id, name: empName(e) });
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <SalaryAnalyticsHeader period={period} onPeriodChange={setPeriod} />

      {/* Summary KPIs (real) */}
      <SummaryKpis summary={summary} sumTotal={sumTotal} sumPaid={sumPaid} sumUnpaid={sumUnpaid} sumAvg={sumAvg} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <PayrollTrendChart />
        <PaidVsUnpaidPie paidVsUnpaid={paidVsUnpaid} periodLabel={periodLabel} />
      </div>

      {/* Avans/Premiya berish — oylik hisoblanmasa ham, istalgan xodimga */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Avans / Premiya berish (oylik hisoblanmasa ham)</label>
          <CustomSelect
            options={employees.map((e) => ({ value: e.id, label: empName(e) }))}
            value={pickEmployee}
            onValueChange={setPickEmployee}
            placeholder="Xodimni tanlang…"
          />
        </div>
        <button
          onClick={openGiveForPicked}
          disabled={!pickEmployee}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          <Plus size={16} /> Avans / Premiya
        </button>
      </div>

      {/* Salary Table (real) */}
      <PayrollTable
        rows={rows}
        isLoading={isLoading}
        periodLabel={periodLabel}
        onAdjust={(salaryId, name) => {
          const row = rows.find((r) => r.salaryId === salaryId);
          if (row) setAdjustTarget({ employeeId: row.employeeId, name });
        }}
        onMarkPaid={(employeeId, salaryId) => setConfirmPay({ employeeId, salaryId })}
        isPaying={paySalary.isPending}
      />

      {/* Bu oydagi avans/premiyalar — ko'rinib turadi */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={18} className="text-slate-400" />
          <h3 className="font-semibold text-slate-900">Avans / Premiyalar — {periodLabel}</h3>
        </div>
        {adjLoading ? (
          <EmptyState variant="loading" size="sm" title="Yuklanmoqda…" />
        ) : teamAdjustments.length === 0 ? (
          <EmptyState size="sm" icon={Wallet} title="Avans/premiya yo'q" description="Bu oy uchun hali avans yoki premiya berilmagan." />
        ) : (
          <div className="space-y-2">
            {teamAdjustments.map((a) => {
              const bonus = a.type === "bonus";
              return (
                <div key={a.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bonus ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                      {bonus ? <Award size={16} /> : <CreditCard size={16} />}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{a.employee_name}</div>
                      <div className="text-xs text-slate-400 truncate">
                        {bonus ? "Premiya" : "Avans"}{a.note ? ` · ${a.note}` : ""} · {new Date(a.created_at).toLocaleDateString("uz-UZ")}
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-bold tabular-nums shrink-0 ${bonus ? "text-emerald-600" : "text-amber-600"}`}>
                    {bonus ? "+" : "−"}{Number(a.amount).toLocaleString("uz-UZ")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmActionModal
        open={!!confirmPay}
        variant="confirm"
        title="Maoshni to'langan deb belgilash?"
        description="Ushbu amal to'lov jarayonini tasdiqlaydi. Davom etasizmi?"
        confirmLabel="Ha, to'lash"
        busy={paySalary.isPending}
        onConfirm={handleMarkPaid}
        onClose={() => setConfirmPay(null)}
      />

      <SalaryAdjustmentModal
        open={!!adjustTarget}
        employeeName={adjustTarget?.name ?? ""}
        defaultType="bonus"
        adjustments={targetAdjustments ?? []}
        busy={giveAdjustment.isPending}
        onClose={() => setAdjustTarget(null)}
        onConfirm={handleAdjustConfirm}
      />
    </div>
  );
}
