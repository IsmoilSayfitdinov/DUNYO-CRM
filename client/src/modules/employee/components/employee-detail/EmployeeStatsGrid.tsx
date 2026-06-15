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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((s) => (
        <div key={s.label}
          className="relative bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-5 shadow-sm hover:shadow-md transition-all overflow-hidden">
          {/* Chap chetdagi rangli aksent chiziq — har karta o'z rangida */}
          <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: s.color }} />
          <div className="text-2xl sm:text-3xl font-black mb-0.5 sm:mb-1 tracking-tight tabular-nums" style={{ color: s.color }}>{s.value}</div>
          <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide sm:tracking-widest leading-tight">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
