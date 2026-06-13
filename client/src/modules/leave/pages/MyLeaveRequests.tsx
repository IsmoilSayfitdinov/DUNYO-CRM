import React, { useState } from "react";
import { Plus, Calendar, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import CustomSelect from "@/shared/ui/CustomSelect";
import CustomDatePicker from "@/shared/ui/CustomDatePicker";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useMyLeaveRequests, useCreateLeaveRequest } from "@/modules/leave";
import { LEAVE_TYPE_OPTIONS, leaveTypeLabel } from "../constants/leave-types";

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const toLocalYMD = (d?: Date) =>
  d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "";

export function MyLeaveRequests() {
  const { data: myData = [], isLoading, isError } = useMyLeaveRequests();
  const create = useCreateLeaveRequest();

  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const myLeave = myData.map((r) => ({
    id: r.id,
    type: r.type ?? "—",
    from: r.start_date,
    to: r.end_date,
    days: r.days,
    reason: r.reason ?? "",
    status: cap(r.status),
    submittedAt: new Date(r.created_at).toLocaleString("uz-UZ"),
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveType || !dateRange.from || !dateRange.to) {
      toast.error("Ta'til turi va sanalarni tanlang");
      return;
    }
    create.mutate(
      {
        type: leaveType,
        start_date: toLocalYMD(dateRange.from),
        end_date: toLocalYMD(dateRange.to),
        reason: reason || undefined,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setShowForm(false);
          setLeaveType("");
          setDateRange({ from: undefined, to: undefined });
          setReason("");
          setTimeout(() => setSubmitted(false), 3000);
        },
      },
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Mening ta'til so'rovlarim</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Ta'til so'rovlarini yuboring va ularning holatini kuzatib boring</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-sm bg-primary text-primary-foreground rounded-xl px-4 py-2.5 hover:opacity-90 transition-all font-bold shadow-lg shadow-primary/20 active:scale-95 h-10 sm:h-11 w-full sm:w-auto justify-center sm:justify-start">
          <Plus size={16} /> Yangi so'rov
        </button>
      </div>

      {submitted && (
        <div className="bg-success/10 border border-success/20 rounded-2xl p-5 flex items-center gap-4 text-sm text-success font-bold uppercase tracking-wide animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
          <CheckCircle size={20} />
          Sizning ta'til so'rovingiz yuborildi va ko'rib chiqilmoqda.
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-xl shadow-slate-100 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Yangi ta'til so'rovi</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <CustomSelect
              label="Ta'til turi *"
              options={LEAVE_TYPE_OPTIONS}
              value={leaveType}
              onValueChange={setLeaveType}
              placeholder="Turini tanlang..."
              className="w-full"
              searchable={false}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomDatePicker
                label="Boshlanish sanasi *"
                value={dateRange.from}
                onChange={(d) => setDateRange(prev => ({ ...prev, from: d }))}
                className="w-full"
              />
              <CustomDatePicker
                label="Tugash sanasi *"
                value={dateRange.to}
                onChange={(d) => setDateRange(prev => ({ ...prev, to: d }))}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 block ml-1">Sabab *</label>
              <textarea 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none bg-slate-50/30 placeholder:text-slate-400 font-medium"
                rows={3} 
                placeholder="Ta'til so'rash sababini batafsilroq yozing..." 
                required 
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={create.isPending} className="flex-1 h-12 bg-primary text-primary-foreground font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-60">
                {create.isPending ? "Yuborilmoqda…" : "So'rovni yuborish"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 h-12 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95">
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200/50 bg-slate-50/50">
          <h3 className="font-bold text-slate-900 tracking-tight">Mening ta'tillar tarixim</h3>
        </div>
        {isLoading ? (
          <EmptyState variant="loading" size="sm" title="Yuklanmoqda…" description="Ta'til so'rovlaringiz olinmoqda" />
        ) : isError ? (
          <EmptyState variant="error" size="sm" title="Yuklab bo'lmadi" description="Ta'til so'rovlarini yuklab bo'lmadi. Qayta urinib ko'ring." />
        ) : myLeave.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="So'rovlar yo'q"
            description="Hozircha hech qanday ta'til so'rovi yuborilmagan, birinchi so'rovingizni yuboring."
            action={
              <button onClick={() => setShowForm(true)} className="text-sm text-primary hover:opacity-80 font-bold px-4 py-2 bg-primary/10 rounded-xl transition-all border border-primary/20">
                Birinchi so'rovni yuboring →
              </button>
            }
          />
        ) : (
          <>
          {/* Mobile card view */}
          <div className="sm:hidden divide-y divide-slate-100">
            {myLeave.map((req) => (
              <div key={req.id} className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900">{leaveTypeLabel(req.type)}</span>
                  <StatusBadge status={req.status as any} />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                  <span>{req.from} – {req.to}</span>
                  <span className="font-bold text-slate-600">{req.days} kun</span>
                </div>
                {req.reason && <p className="text-xs text-slate-400 line-clamp-1">{req.reason}</p>}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-xs font-bold text-slate-400 px-5 py-4 uppercase tracking-wider">Ta'til turi</th>
                  <th className="text-left text-xs font-bold text-slate-400 px-5 py-4 uppercase tracking-wider">Davr</th>
                  <th className="text-left text-xs font-bold text-slate-400 px-5 py-4 uppercase tracking-wider">Kunlar</th>
                  <th className="text-left text-xs font-bold text-slate-400 px-5 py-4 uppercase tracking-wider hidden md:table-cell">Sabab</th>
                  <th className="text-left text-xs font-bold text-slate-400 px-5 py-4 uppercase tracking-wider hidden lg:table-cell">Yuborilgan</th>
                  <th className="text-left text-xs font-bold text-slate-400 px-5 py-4 uppercase tracking-wider">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {myLeave.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-bold text-slate-900">{leaveTypeLabel(req.type)}</td>
                    <td className="px-5 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">{req.from} – {req.to}</td>
                    <td className="px-5 py-4 text-sm font-extrabold text-slate-900">{req.days} kun</td>
                    <td className="px-5 py-4 text-sm text-slate-400 max-w-[200px] truncate hidden md:table-cell">{req.reason}</td>
                    <td className="px-5 py-4 text-xs text-slate-400 font-medium hidden lg:table-cell whitespace-nowrap">{req.submittedAt}</td>
                    <td className="px-5 py-4"><StatusBadge status={req.status as any} /></td>
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
