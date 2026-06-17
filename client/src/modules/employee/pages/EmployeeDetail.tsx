import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { EmptyState } from "@/shared/ui/EmptyState";
import { toHHMM, ATTENDANCE_BADGE, STATUS_TO_BACKEND } from "@/shared/utils";
import { Nfc } from "lucide-react";
import { useEmployee, AddEditEmployeeModal, NfcEnrollModal, useSaveEmployee, useSetEmployeeActive } from "@/modules/employee";
import { useEmployeeAttendance, EditAttendanceModal, useUpdateAttendance } from "@/modules/attendance";
import { useEmployeeSalary, useCalculateSalary, usePaySalary, useGiveAdjustment, useAdjustments, SalaryAdjustmentModal } from "@/modules/salary";
import {
  EmployeeProfileHeader,
  EmployeeStatsGrid,
  AttendanceCalendar,
  SalaryHistoryCard,
  EmployeeAdjustmentsCard,
  AttendanceRecordsTable,
  ManagerNotes,
} from "../components/employee-detail";

const MONTHS_UZ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

export function EmployeeDetail() {
  
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const monthDate = new Date(period.year, period.month - 1, 1);

  const { data: emp, isLoading, isError } = useEmployee(id);
  const { data: attData } = useEmployeeAttendance(id, { year: period.year, month: period.month, limit: 50 });
  const { data: salaryData } = useEmployeeSalary(id, { limit: 24 });

  const [modalOpen, setModalOpen] = useState(false);
  const [nfcOpen, setNfcOpen] = useState(false); // NFC enroll modali ochiq/yopiq
  const [editRecord, setEditRecord] = useState<any>(null);
  
  const saveEmployee = useSaveEmployee(id);
  const setActive = useSetEmployeeActive();
  const updateAttendance = useUpdateAttendance(editRecord?.id ?? "");
  const calculateSalary = useCalculateSalary();
  const paySalary = usePaySalary();
  const giveAdjustment = useGiveAdjustment();
  // Avans/premiya modali ochiq bo'lganda — true (oylik hisoblanmasa ham berish mumkin).
  const [adjustOpen, setAdjustOpen] = useState(false);
  // Shu xodimning tanlangan oydagi avans/premiyalari — ham modalda, ham alohida kartada.
  const { data: periodAdjustments, isLoading: adjLoading } = useAdjustments(id, period.year, period.month);

  useEffect(() => { setEditRecord(null); setModalOpen(false); setNfcOpen(false); setAdjustOpen(false); }, [id]);

  if (isLoading) {
    return <EmptyState variant="loading" title="Yuklanmoqda…" description="Xodim ma'lumotlari olinmoqda" />;
  }
  if (isError || !emp) {
    return <EmptyState variant="error" title="Yuklab bo'lmadi" description="Xodim ma'lumotini yuklab bo'lmadi." />;
  }

  const fullName = `${emp.user.first_name} ${emp.user.last_name}`.trim() || emp.user.username;
  const periodLabel = `${MONTHS_UZ[period.month - 1]} ${period.year}`;

  // Tanlangan oy (kalendardagi period) uchun ish haqi yozuvi — Hisoblash/To'lash holatini shu belgilaydi.
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const periodKey = `${period.year}-${pad2(period.month)}`;
  const periodSalary = (salaryData ?? []).find((s) => String(s.month).slice(0, 7) === periodKey);

  // Oylik hisoblash faqat OY TUGAGANDAN keyin (joriy/kelajak oyda emas).
  const now = new Date();
  const isPeriodEnded =
    period.year < now.getFullYear() ||
    (period.year === now.getFullYear() && period.month < now.getMonth() + 1);

  const handleCalculateSalary = () =>
    calculateSalary.mutate({ employeeId: emp.id, year: period.year, month: period.month });
  const handlePaySalary = () => {
    if (periodSalary) paySalary.mutate({ employeeId: emp.id, salaryId: periodSalary.id });
  };
  const handleAdjustConfirm = (adjustment: { type: "bonus" | "advance"; amount: number; reason: string }) => {
    // Avans = oylikdan OLDIN olinadigan pul. salary_id shart emas — oylik hisoblanmasa
    // ham itemli yozuv yaratiladi (POST /salary-history/adjustment).
    giveAdjustment.mutate(
      {
        employee_id: emp.id,
        type: adjustment.type,
        amount: adjustment.amount,
        note: adjustment.reason || null,
        year: period.year,
        month: period.month,
      },
      { onSuccess: () => setAdjustOpen(false) },
    );
  };

  const attRows = (attData?.items ?? []).map((a) => ({
    id: a.id,
    work_date: a.work_date,
    date: a.work_date,
    checkIn: toHHMM(a.check_in),
    checkOut: toHHMM(a.check_out),
    status: a.status,
    badge: ATTENDANCE_BADGE[a.status] ?? a.status,
    notes: a.notes ?? "",
    duration: a.duration_hours ? `${a.duration_hours}h` : "-",
    earned: Number(a.earned_amount) || 0,
  }));

  const handleSaveAttendance = (updated: any) => {
    if (!editRecord) return;
    const toDate = (t: string): Date | null => {
      if (!t) return null;
      const d = new Date(`${editRecord.work_date}T${t}:00`);
      return isNaN(d.getTime()) ? null : d;
    };
    const checkIn = toDate(updated.checkIn);
    let checkOut = toDate(updated.checkOut);
    if (checkIn && checkOut && checkOut.getTime() < checkIn.getTime()) {
      checkOut = new Date(checkOut.getTime() + 24 * 60 * 60 * 1000);
    }
    updateAttendance.mutate(
      {
        status: STATUS_TO_BACKEND[updated.status] ?? updated.status,
        check_in: checkIn ? checkIn.toISOString() : null,
        check_out: checkOut ? checkOut.toISOString() : null,
        notes: updated.notes ?? undefined,
      },
      { onSuccess: () => setEditRecord(null) },
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Breadcrumb + NFC tugmasi (vaqtincha shu yerda — keyin chiroyli joyga ko'chiriladi) */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button onClick={() => navigate("/leader/staff")} className="hover:text-slate-700 transition-colors">Xodimlar</button>
          <span className="text-slate-600">/</span>
          <span className="text-slate-900 font-medium">{fullName}</span>
        </div>
        <button
          onClick={() => setNfcOpen(true)}
          className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-primary to-red-700 text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:opacity-95 transition-all active:scale-[0.98]"
        >
          <Nfc size={16} /> NFC karta
        </button>
      </div>

      <EmployeeProfileHeader
        emp={emp}
        periodSalary={periodSalary}
        periodLabel={periodKey}
        canCalculate={isPeriodEnded}
        onEdit={() => setModalOpen(true)}
        onToggleActive={(next) => setActive.mutate({ id: emp.id, isActive: next })}
        isToggling={setActive.isPending}
        onCalculateSalary={handleCalculateSalary}
        onPaySalary={handlePaySalary}
        isCalculating={calculateSalary.isPending}
        isPaying={paySalary.isPending}
      />

      <EmployeeStatsGrid attRows={attRows} hourlyRate={emp.hourly_rate} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AttendanceCalendar period={period} onPeriodChange={setPeriod} attRows={attRows} />
        <SalaryHistoryCard
          salaryData={salaryData}
          onGiveAdjustment={() => setAdjustOpen(true)}
        />
      </div>

      {/* Tanlangan oydagi avans/premiyalar — alohida karta */}
      <EmployeeAdjustmentsCard
        adjustments={periodAdjustments}
        periodLabel={periodLabel}
        isLoading={adjLoading}
      />

      <AttendanceRecordsTable
        attRows={attRows}
        monthDate={monthDate}
        onEditRecord={(r) => setEditRecord({ ...r, status: r.badge })}
      />

      <ManagerNotes employeeId={id} employeeName={fullName} />

      <AddEditEmployeeModal
        open={modalOpen}
        employee={emp}
        onClose={() => setModalOpen(false)}
        onSave={(values) => saveEmployee.mutate(values, { onSuccess: () => setModalOpen(false) })}
        isSaving={saveEmployee.isPending}
      />
      <EditAttendanceModal open={!!editRecord} record={editRecord} onClose={() => setEditRecord(null)} onSave={handleSaveAttendance} />

      {/* NFC karta biriktirish modali. currentUid hozircha bo'sh — backend tayyor bo'lgach
          emp.nfc_uid'ni shu yerga uzatasan. Logika (o'qish/saqlash) modal ichida TODO(sen). */}
      <NfcEnrollModal
        open={nfcOpen}
        onClose={() => setNfcOpen(false)}
        employeeName={fullName}
        currentUid={emp?.nfc_uid}
        employeeId={id}
      />

      <SalaryAdjustmentModal
        open={adjustOpen}
        employeeName={fullName}
        defaultType="advance"
        adjustments={periodAdjustments ?? []}
        busy={giveAdjustment.isPending}
        onClose={() => setAdjustOpen(false)}
        onConfirm={handleAdjustConfirm}
      />
    </div>
  );
}
