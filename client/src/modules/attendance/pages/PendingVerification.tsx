import React, { useState } from "react";
import { AlertTriangle, CheckCircle, X, Eye } from "lucide-react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { pendingVerifications } from "@/modules/attendance";
import { employees } from "@/modules/employee";

export function PendingVerification() {
  const [items, setItems] = useState(pendingVerifications);
  const [resolved, setResolved] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const resolve = (id: number, action: "approved" | "rejected" | "reviewed") => {
    setResolved((r) => [...r, id]);
  };

  const active = items.filter((i) => !resolved.includes(i.id));

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Tasdiqlash kutilmoqda</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Shubhali yoki qo'lda kiritilgan davomat yozuvlarini ko'rib chiqish</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Kutilmoqda", value: active.length, color: "var(--warning)" },
          { label: "Kritik holatlar", value: items.filter((i) => i.severity === "critical").length, color: "var(--destructive)" },
          { label: "Bugun hal qilingan", value: resolved.length, color: "var(--success)" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-5 transition-all hover:shadow-lg">
            <div className="text-xl sm:text-3xl font-black mb-1 tracking-tight" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {active.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center shadow-sm">
          <CheckCircle size={48} className="text-success mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-lg mb-1">Hammasi joyida!</h3>
          <p className="text-sm text-slate-400">Kutilayotgan tasdiqlashlar yo'q. Barcha davomat yozuvlari to'g'ri!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {active.map((item) => {
            const emp = employees.find((e) => e.id === item.employeeId);
            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border overflow-hidden ${
                  item.severity === "critical" ? "border-red-200" : "border-amber-200"
                }`}
              >
                <div className={`px-3 sm:px-5 py-3 flex items-center gap-3 ${
                  item.severity === "critical" ? "bg-destructive/10" : "bg-warning/10"
                }`}>
                  <AlertTriangle size={16} className={item.severity === "critical" ? "text-destructive" : "text-warning"} />
                  <span className={`text-sm font-bold ${item.severity === "critical" ? "text-destructive" : "text-warning"}`}>
                    {item.type}
                  </span>
                  <span className={`ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                    item.severity === "critical"
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-warning/10 text-warning border-warning/20"
                  }`}>
                    {item.severity === "critical" ? "Kritik" : "Ogohlantirish"}
                  </span>
                </div>
                <div className="p-3 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold shrink-0"
                      style={{ background: `hsl(${(item.employeeId * 15) % 40}, 70%, 55%)` }}
                    >
                      {item.employee.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{item.employee}</h3>
                          <p className="text-sm text-slate-400 mt-0.5">{emp?.role} · {item.date} {item.time} da</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg p-3">{item.details}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <input
                      className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none mb-3"
                      placeholder="Menejer izohi..."
                      value={notes[item.id] || ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [item.id]: e.target.value }))}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => resolve(item.id, "approved")}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                      >
                        <CheckCircle size={15} /> Tasdiqlash
                      </button>
                      <button
                        onClick={() => resolve(item.id, "rejected")}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-destructive/20 text-destructive text-sm font-bold rounded-xl hover:bg-destructive/5 transition-all active:scale-[0.98]"
                      >
                        <X size={15} /> Rad etish
                      </button>
                      <button
                        onClick={() => resolve(item.id, "reviewed")}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-700 transition-all active:scale-[0.98]"
                      >
                        <Eye size={15} /> Ko'rib chiqildi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
