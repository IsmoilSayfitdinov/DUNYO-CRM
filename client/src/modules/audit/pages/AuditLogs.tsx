import React, { useState } from "react";
import { Search, Download, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { EmptyState } from "@/shared/ui/EmptyState";
import CustomSelect from "@/shared/ui/CustomSelect";
import CustomDatePicker from "@/shared/ui/CustomDatePicker";
import { auditLogs } from "@/modules/audit";

const ACTION_OPTIONS = [
  { value: "All", label: "Barcha usullar" },
  { value: "QR", label: "QR kod" },
  { value: "Web", label: "Veb panel" },
];

const STATUS_OPTIONS = [
  { value: "All", label: "Barcha holatlar" },
  { value: "Success", label: "Muvaffaqiyatli" },
  { value: "Warning", label: "Ogohlantirish" },
  { value: "Failed", label: "Muvaffaqiyatsiz" },
];

export function AuditLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  // Sana ixtiyoriy: tanlanmasa — barcha jurnal yozuvlari ko'rsatiladi.
  const [date, setDate] = useState<Date | undefined>(undefined);

  const pad = (n: number) => String(n).padStart(2, "0");
  const selectedDateStr = date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : null;

  const filtered = auditLogs.filter((log) => {
    const matchSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "All" || log.method === actionFilter;
    const matchStatus = statusFilter === "All" || log.status === statusFilter;
    const matchDate = !selectedDateStr || String(log.timestamp).slice(0, 10) === selectedDateStr;
    return matchSearch && matchAction && matchStatus && matchDate;
  });

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">{"Audit jurnali"}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{"Tizim harakatlarining to'liq tarixi"}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center">
            <Download size={14} /> Eksport <span className="hidden sm:inline">qilish</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Jami voqealar", value: auditLogs.length, color: "var(--primary)" },
          { label: "Muvaffaqiyatli", value: auditLogs.filter((l) => l.status === "Success").length, color: "var(--success)" },
          { label: "Ogohlantirishlar", value: auditLogs.filter((l) => l.status === "Warning").length, color: "var(--warning)" },
          { label: "Muvaffaqiyatsiz", value: auditLogs.filter((l) => l.status === "Failed").length, color: "var(--destructive)" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-5 shadow-sm hover:shadow-md transition-all">
            <div className="text-xl sm:text-3xl font-black mb-1 tracking-tight" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 flex flex-wrap items-end gap-4 shadow-sm">
        <div className="space-y-1.5 flex-[1.5] min-w-[250px]">
          <label className="text-sm font-medium text-slate-700 ml-1">Qidiruv</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              placeholder={"Harakatlar, foydalanuvchilar, maqsadlarni qidirish..."}
            />
          </div>
        </div>

        <CustomSelect
          label="Harakat usuli"
          options={ACTION_OPTIONS}
          value={actionFilter}
          onValueChange={setActionFilter}
          className="flex-1 min-w-[180px]"
          searchable={false}
        />

        <CustomSelect
          label="Holati"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="flex-1 min-w-[180px]"
          searchable={false}
        />

        <CustomDatePicker
          label="Sana"
          value={date}
          onChange={setDate}
          placeholder="Barcha sanalar"
          className="flex-1 min-w-[200px]"
        />
        
        <div className="flex items-center justify-end h-11 px-2">
          <span className="text-xs text-slate-400 whitespace-nowrap">{`${filtered.length} / ${auditLogs.length} ta yozuv`}</span>
        </div>
      </div>

      {/* Audit log table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState size="sm" icon={Shield} title="Yozuv topilmadi" description="Qidiruv va filtrlarga mos audit yozuvi yo'q." />
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-slate-200/60">
              {filtered.map((log) => (
                <div key={log.id} className="p-3.5 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Shield size={14} className={`shrink-0 ${log.status === "Warning" ? "text-warning" : log.status === "Failed" ? "text-destructive" : "text-slate-400"}`} />
                      <span className="text-sm font-bold text-slate-800 truncate">{log.action}</span>
                    </div>
                    <StatusBadge status={log.status as any} />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 truncate">{log.user}</span>
                    <span className="text-xs text-slate-400 shrink-0">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      { h: "#", cls: "hidden md:table-cell" },
                      { h: "Harakat", cls: "" },
                      { h: "Kim tomonidan", cls: "" },
                      { h: "Maqsad", cls: "hidden lg:table-cell" },
                      { h: "Usul", cls: "" },
                      { h: "Holati", cls: "" },
                      { h: "IP manzili", cls: "hidden md:table-cell" },
                      { h: "Vaqt tamg'asi", cls: "" },
                    ].map(({ h, cls }) => (
                      <th key={h} className={`text-left text-xs font-semibold text-slate-400 px-5 py-3 ${cls}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="hidden md:table-cell px-5 py-3.5 text-xs text-slate-400 font-mono">{String(log.id).padStart(4, "0")}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className={log.status === "Warning" ? "text-warning" : log.status === "Failed" ? "text-destructive" : "text-slate-400"} />
                          <span className="text-sm font-bold text-slate-800">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{log.user}</td>
                      <td className="hidden lg:table-cell px-5 py-3.5 text-sm text-slate-600">{log.target}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={log.method as any} showDot={false} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={log.status as any} />
                      </td>
                      <td className="hidden md:table-cell px-5 py-3.5 text-xs font-mono text-slate-400">{log.ip}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-400">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-3 border-t border-slate-200/50 bg-slate-50">
          <span className="text-xs text-slate-400 min-w-0 truncate">{`${filtered.length} natija ko'rsatilmoqda`}</span>
          <div className="flex items-center gap-2 shrink-0">
            <button aria-label="Oldingi sahifa" className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white transition-all shadow-sm">
              <ChevronLeft size={14} />
            </button>
            {[1, 2, 3].map((p) => (
              <button key={p} className={`w-10 h-10 rounded-lg text-xs font-bold transition-all shadow-sm ${p === 1 ? "bg-primary text-primary-foreground" : "border border-slate-200 text-slate-400 hover:bg-white"}`}>{p}</button>
            ))}
            <button aria-label="Keyingi sahifa" className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white transition-all shadow-sm">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
