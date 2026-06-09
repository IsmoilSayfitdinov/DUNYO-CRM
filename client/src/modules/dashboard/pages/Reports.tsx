import { useState } from "react";
import { Calendar, FileSpreadsheet, FileText, Download, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { CustomSelect } from "@/shared/ui/CustomSelect";
import { downloadExcel } from "@/shared/lib/excel";
import { salaryApi } from "@/modules/salary";
import { leaveApi } from "@/modules/leave";
import { attendanceApi } from "@/modules/attendance";

const MONTHS_UZ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const money = (v: string | number) => Number(v || 0).toLocaleString("uz-UZ");
const statusUz: Record<string, string> = { pending: "Kutilmoqda", approved: "Tasdiqlangan", rejected: "Rad etilgan" };

export function Reports() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [busy, setBusy] = useState<string | null>(null);

  const periodLabel = `${MONTHS_UZ[month - 1]} ${year}`;
  const suffix = `${year}-${String(month).padStart(2, "0")}`;

  const yearOptions = [year - 1, year, year + 1].map((y) => ({ value: String(y), label: String(y) }));
  const monthOptions = MONTHS_UZ.map((m, i) => ({ value: String(i + 1), label: m }));

  const run = async (id: string, fn: () => Promise<unknown>) => {
    setBusy(id);
    try {
      await fn();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Hisobotni yuklab bo'lmadi");
    } finally {
      setBusy(null);
    }
  };

  const reports = [
    {
      id: "salary",
      title: "Ish haqi hisoboti",
      desc: "Har xodim: baza, premiya/avans, yakuniy summa va to'lov holati.",
      icon: FileSpreadsheet,
      color: "var(--success)",
      action: () =>
        run("salary", async () => {
          const data = await salaryApi.getAll({ year, month, limit: 100 });
          if (!data.length) return toast.info("Bu oy uchun ish haqi ma'lumoti yo'q");
          const rows = data.map((s) => {
            const u = s.employee?.user;
            const name = u ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.username : s.employee_id.slice(0, 8);
            return {
              "Xodim": name,
              "Lavozim": s.employee?.position ?? "—",
              "Baza (so'm)": money(s.base_salary),
              "Premiya/Avans (so'm)": money(s.bonus),
              "Yakuniy (so'm)": money(s.final_salary),
              "Holat": s.is_paid ? "To'langan" : "To'lanmagan",
            };
          });
          downloadExcel(`DUNYO_ish-haqi_${suffix}`, `Ish haqi ${suffix}`, rows);
        }),
    },
    {
      id: "attendance",
      title: "Davomat hisoboti",
      desc: "Har xodim: kelgan, kechikkan, o'z vaqtida va jami yozuvlar.",
      icon: Calendar,
      color: "var(--primary)",
      action: () =>
        run("attendance", async () => {
          const data = await attendanceApi.report(year, month);
          if (!data.length) return toast.info("Xodim topilmadi");
          const rows = data.map((r) => ({
            "Xodim": r.employee_name,
            "Kelgan": r.present,
            "Kechikkan": r.late,
            "O'z vaqtida": r.on_time,
            "Jami yozuv": r.total,
          }));
          downloadExcel(`DUNYO_davomat_${suffix}`, `Davomat ${suffix}`, rows);
        }),
    },
    {
      id: "adjustments",
      title: "Avans / Premiya hisoboti",
      desc: "Shu oyda berilgan barcha avans va premiyalar ro'yxati.",
      icon: Wallet,
      color: "var(--warning)",
      action: () =>
        run("adjustments", async () => {
          const data = await salaryApi.listTeamAdjustments(year, month);
          if (!data.length) return toast.info("Bu oy uchun avans/premiya yo'q");
          const rows = data.map((a) => ({
            "Xodim": a.employee_name,
            "Tur": a.type === "bonus" ? "Premiya" : "Avans",
            "Summa (so'm)": money(a.amount),
            "Izoh": a.note ?? "",
            "Sana": new Date(a.created_at).toLocaleDateString("uz-UZ"),
          }));
          downloadExcel(`DUNYO_avans-premiya_${suffix}`, `Avans-Premiya ${suffix}`, rows);
        }),
    },
    {
      id: "leave",
      title: "Ta'tillar hisoboti",
      desc: "Barcha ta'til so'rovlari: tur, sanalar, holat va sabab.",
      icon: FileText,
      color: "var(--primary)",
      action: () =>
        run("leave", async () => {
          const data = await leaveApi.getForLeader();
          if (!data.length) return toast.info("Ta'til so'rovlari yo'q");
          const rows = data.map((l) => ({
            "Xodim": l.employee_name ?? "—",
            "Tur": l.type ?? "—",
            "Boshlanish": l.start_date,
            "Tugash": l.end_date,
            "Holat": statusUz[l.status] ?? l.status,
            "Sabab": l.reason ?? "",
          }));
          downloadExcel(`DUNYO_tatillar_${suffix}`, "Tatillar", rows);
        }),
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Hisobotlar</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Real ma'lumotlardan Excel (.xlsx) hisobot yuklab oling</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32"><CustomSelect options={monthOptions} value={String(month)} onValueChange={(v) => setMonth(Number(v))} /></div>
          <div className="w-24"><CustomSelect options={yearOptions} value={String(year)} onValueChange={(v) => setYear(Number(v))} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((r) => {
          const Icon = r.icon;
          const loading = busy === r.id;
          return (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${r.color}, transparent 88%)` }}>
                  <Icon size={20} style={{ color: r.color }} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">{r.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{r.desc}</p>
                </div>
              </div>
              <div className="mt-auto pt-3">
                <button
                  onClick={r.action}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {loading ? "Tayyorlanmoqda…" : `Excel — ${periodLabel}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
