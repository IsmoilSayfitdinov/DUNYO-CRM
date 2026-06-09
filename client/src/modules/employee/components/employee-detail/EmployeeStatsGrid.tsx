interface AttRow { status: string }

interface Props {
  attRows: AttRow[];
  hourlyRate: number | string;
}

export function EmployeeStatsGrid({ attRows, hourlyRate }: Props) {
  const lateDays = attRows.filter((r) => r.status === "late").length;
  const leaveDays = attRows.filter((r) => r.status === "leave").length;
  const presentDays = attRows.filter((r) => r.status === "came").length;
  const attPct = attRows.length ? Math.round((presentDays / attRows.length) * 100) : null;

  const cards = [
    { label: "Davomat ko'rsatkichi", value: attPct != null ? `${attPct}%` : "—", color: "var(--success)" },
    { label: "Soatlik stavka", value: Number(hourlyRate).toLocaleString(), color: "var(--primary)" },
    { label: "Kechikish kunlari", value: String(lateDays), color: "var(--warning)" },
    { label: "Ta'til kunlari", value: String(leaveDays), color: "var(--primary)" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((s) => (
        <div key={s.label} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-5 shadow-sm hover:shadow-md transition-all">
          <div className="text-xl sm:text-3xl font-black mb-1 tracking-tight" style={{ color: s.color }}>{s.value}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
