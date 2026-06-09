import { useState } from "react";
import { Search, Grid, List } from "lucide-react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { EmptyState } from "@/shared/ui/EmptyState";
import CustomSelect from "@/shared/ui/CustomSelect";
import { useEmployees } from "@/modules/employee";
import { useTeamAttendance } from "@/modules/attendance";
import { toHHMM, ATTENDANCE_BADGE } from "@/shared/utils";

const TODAY_STATUS_OPTIONS = [
  { value: "All", label: "Barcha holatlar" },
  { value: "Keldi", label: "Keldi" },
  { value: "Kechikdi", label: "Kechikdi" },
  { value: "Kelmadi", label: "Kelmadi" },
  { value: "Sababli", label: "Sababli" },
  { value: "Ta'tilda", label: "Ta'tilda" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const todayStr = (() => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
const hue = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

export function TodayEmployees() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState<"grid" | "list">("list");

  // Real API: barcha xodimlar + bugungi jamoa davomati (employee_id bo'yicha birlashtiramiz)
  const { data: empData, isLoading, isError } = useEmployees({ limit: 100, offset: 0 });
  const { data: team } = useTeamAttendance(todayStr);
  const teamMap = new Map((team ?? []).map((a) => [a.employee_id, a]));

  const data = (empData?.items ?? []).map((emp) => {
    const rec = teamMap.get(emp.id);
    const name = `${emp.user.first_name ?? ""} ${emp.user.last_name ?? ""}`.trim() || emp.user.username;
    return {
      id: emp.id,
      name,
      position: emp.position ?? "",
      shift: `${(emp.shift_start || "").slice(0, 5)}–${(emp.shift_end || "").slice(0, 5)}`,
      checkIn: toHHMM(rec?.check_in ?? null),
      checkOut: toHHMM(rec?.check_out ?? null),
      status: rec ? (ATTENDANCE_BADGE[rec.status] ?? rec.status) : "Kelmadi",
    };
  });

  const filtered = data.filter((emp) => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || emp.status === filter;
    return matchSearch && matchFilter;
  });

  const statusLabels: Record<string, string> = { Keldi: "Keldi", Kechikdi: "Kechikdi", Kelmadi: "Kelmadi", Sababli: "Sababli", "Ta'tilda": "Ta'tilda" };
  const counts = {
    Keldi: data.filter((e) => e.status === "Keldi").length,
    Kechikdi: data.filter((e) => e.status === "Kechikdi").length,
    Kelmadi: data.filter((e) => e.status === "Kelmadi").length,
    Sababli: data.filter((e) => e.status === "Sababli").length,
    "Ta'tilda": data.filter((e) => e.status === "Ta'tilda").length,
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Bugungi xodimlar</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Bugungi ish kunidagi xodimlar holati va davomati</p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(counts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilter(filter === status ? "All" : status)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              filter === status ? "bg-white text-slate-900 border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {statusLabels[status]} <span className="font-bold">{count}</span>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-4 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex-[1.5] w-full sm:w-auto sm:min-w-[250px] space-y-1.5">
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

        <CustomSelect
          label="Sana holati"
          options={TODAY_STATUS_OPTIONS}
          value={filter}
          onValueChange={setFilter}
          className="w-full sm:flex-1 sm:min-w-[180px]"
          searchable={false}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 ml-1">Ko'rinish</label>
          <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1 h-10 sm:h-11 items-center">
            <button onClick={() => setView("list")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "list" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-700"}`}>
              <List size={14} /> Jadval
            </button>
            <button onClick={() => setView("grid")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "grid" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-700"}`}>
              <Grid size={14} /> Setka
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end h-10 sm:h-11 px-2">
          <span className="text-xs text-slate-400 whitespace-nowrap">{filtered.length} ta xodim</span>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200"><EmptyState variant="loading" title="Yuklanmoqda…" description="Xodimlar olinmoqda" /></div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-slate-200"><EmptyState variant="error" title="Yuklab bo'lmadi" description="Ma'lumotni yuklab bo'lmadi." /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200"><EmptyState title="Xodim topilmadi" description="Filtrga mos xodim yo'q." /></div>
      ) : view === "list" ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3">Xodim</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3 hidden lg:table-cell">Smena</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3">Kirish</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3 hidden sm:table-cell">Chiqish</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 sm:px-5 py-3">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 sm:px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                          style={{ background: `hsl(${hue(emp.id)}, 65%, 55%)` }}>
                          {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">{emp.name}</div>
                          <div className="text-xs text-slate-400 truncate">{emp.position || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3.5 text-xs text-slate-400 hidden lg:table-cell">{emp.shift}</td>
                    <td className="px-3 sm:px-5 py-3.5 text-sm font-medium text-slate-800">{emp.checkIn || "—"}</td>
                    <td className="px-3 sm:px-5 py-3.5 text-sm text-slate-400 hidden sm:table-cell">{emp.checkOut || "—"}</td>
                    <td className="px-3 sm:px-5 py-3.5"><StatusBadge status={emp.status as any} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((emp) => (
            <div key={emp.id} className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3"
                style={{ background: `hsl(${hue(emp.id)}, 65%, 55%)` }}>
                {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="text-sm font-semibold text-slate-800 mb-0.5 truncate">{emp.name}</div>
              <div className="text-xs text-slate-400 mb-3 truncate">{emp.position || "—"}</div>
              <StatusBadge status={emp.status as any} />
              {emp.checkIn && <div className="text-xs text-slate-400 mt-2">Kirish: {emp.checkIn}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
