import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { EmptyState } from "@/shared/ui/EmptyState";
import CustomSelect from "@/shared/ui/CustomSelect";
import CustomDatePicker from "@/shared/ui/CustomDatePicker";
import { useTeamAttendance } from "@/modules/attendance";
import { useEmployees } from "@/modules/employee";
import { toHHMM, ATTENDANCE_BADGE } from "@/shared/utils";

const ATTENDANCE_STATUS_OPTIONS = [
  { value: "All", label: "Barcha holatlar" },
  { value: "Keldi", label: "Keldi" },
  { value: "Kechikdi", label: "Kechikdi" },
  { value: "Kelmadi", label: "Kelmadi" },
  { value: "Sababli", label: "Sababli" },
  { value: "Ta'tilda", label: "Ta'tilda" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const toDateStr = (d?: Date) => (d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : undefined);
const hue = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

export function AttendanceRecords() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const dateStr = toDateStr(date);
  // Real API: tanlangan kun bo'yicha butun jamoa davomati + ism uchun xodimlar ro'yxati
  const { data: team, isLoading, isError } = useTeamAttendance(dateStr);
  const { data: empData } = useEmployees({ limit: 100, offset: 0 });

  const empMap = new Map((empData?.items ?? []).map((e) => [e.id, e]));

  const rows = (team ?? []).map((a) => {
    const emp = empMap.get(a.employee_id);
    const name = emp
      ? `${emp.user.first_name ?? ""} ${emp.user.last_name ?? ""}`.trim() || emp.user.username
      : a.employee_id.slice(0, 8);
    return {
      id: a.id,
      employee_id: a.employee_id,
      employee: name,
      position: emp?.position ?? "",
      checkIn: toHHMM(a.check_in),
      checkOut: toHHMM(a.check_out),
      status: ATTENDANCE_BADGE[a.status] ?? a.status,
      notes: a.notes ?? "",
    };
  });

  const filtered = rows.filter((r) => {
    const matchSearch = r.employee.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Tanlangan kun bo'yicha holat sanoqlari (butun kun, filtrdan qat'i nazar)
  const countBy = (label: string) => rows.filter((r) => r.status === label).length;
  const dayStats = [
    { label: "Keldi", value: countBy("Keldi"), text: "text-success", bg: "bg-success/10" },
    { label: "Kechikdi", value: countBy("Kechikdi"), text: "text-warning", bg: "bg-warning/10" },
    { label: "Kelmadi", value: countBy("Kelmadi"), text: "text-destructive", bg: "bg-destructive/10" },
    { label: "Sababli", value: countBy("Sababli"), text: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Ta'tilda", value: countBy("Ta'tilda"), text: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Kunlik davomat nazorati</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Tanlangan kun bo'yicha butun jamoa — xodimni bossangiz, uning to'liq profiliga o'tasiz</p>
      </div>

      {/* Kunlik holat sanoqlari */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {dayStats.map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">{s.label}</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums mt-0.5">{s.value}</div>
            </div>
            <div className={`w-9 h-9 rounded-lg ${s.bg} ${s.text} flex items-center justify-center shrink-0 text-sm font-black`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-wrap items-end gap-4 shadow-sm">
        <div className="space-y-1.5 flex-[1.5] w-full sm:w-auto sm:min-w-[250px]">
          <label className="text-sm font-medium text-slate-700 ml-1">Qidiruv</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 sm:h-11 w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              placeholder="Xodimni qidirish..."
            />
          </div>
        </div>

        <CustomDatePicker
          label="Sana"
          value={date}
          onChange={setDate}
          className="w-full sm:flex-1 sm:min-w-[200px]"
        />

        <CustomSelect
          label="Holati"
          options={ATTENDANCE_STATUS_OPTIONS}
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-full sm:flex-1 sm:min-w-[180px]"
          searchable={false}
        />

        <div className="flex items-center justify-end h-10 sm:h-11 px-2">
          <span className="text-xs text-slate-400 whitespace-nowrap">{filtered.length} ta yozuv</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <EmptyState variant="loading" title="Yuklanmoqda…" description="Davomat yozuvlari olinmoqda" />
        ) : isError ? (
          <EmptyState variant="error" title="Yuklab bo'lmadi" description="Davomat yozuvlarini yuklab bo'lmadi." />
        ) : filtered.length === 0 ? (
          <EmptyState title="Yozuv yo'q" description="Bu kun va filtrlar bo'yicha davomat yozuvi topilmadi." />
        ) : (
          <>
          {/* ===== MOBIL: kartalar (<640px) ===== */}
          <div className="sm:hidden divide-y divide-slate-200/60">
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/leader/employees/${r.employee_id}`)}
                className="w-full text-left p-3.5 active:bg-slate-50 transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                  style={{ background: `hsl(${hue(r.employee_id)}, 65%, 55%)` }}>
                  {r.employee.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{r.employee}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span>↓ {r.checkIn || "—"}</span>
                    <span className="text-slate-300">·</span>
                    <span>↑ {r.checkOut || "—"}</span>
                    {r.position && <span className="text-slate-400 truncate">· {r.position}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <StatusBadge status={r.status as any} />
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </button>
            ))}
          </div>

          {/* ===== DESKTOP: jadval (sm+) ===== */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3">Xodim</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3">Kirish</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3 hidden sm:table-cell">Chiqish</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3 hidden md:table-cell">Lavozim</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3">Holat</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3 hidden lg:table-cell">Izohlar</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/leader/employees/${r.employee_id}`)}
                    className="group hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-3 sm:px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                          style={{ background: `hsl(${hue(r.employee_id)}, 65%, 55%)` }}>
                          {r.employee.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-slate-800">{r.employee}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3.5 text-sm font-medium text-slate-800">{r.checkIn || "—"}</td>
                    <td className="px-3 sm:px-5 py-3.5 text-sm text-slate-400 hidden sm:table-cell">{r.checkOut || "—"}</td>
                    <td className="px-3 sm:px-5 py-3.5 text-sm text-slate-400 hidden md:table-cell">{r.position || "—"}</td>
                    <td className="px-3 sm:px-5 py-3.5"><StatusBadge status={r.status as any} /></td>
                    <td className="px-3 sm:px-5 py-3.5 text-xs text-slate-400 max-w-xs truncate hidden lg:table-cell">{r.notes || "—"}</td>
                    <td className="px-2 py-3.5 text-right">
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
