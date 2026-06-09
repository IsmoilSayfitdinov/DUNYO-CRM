interface ScoreRingProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

/** Intizom balli uchun aylanma indikator. 4 ta sahifada takrorlanardi — shu yerga birlashtirildi. */
export function ScoreRing({ score, size = 56, showLabel = false }: ScoreRingProps) {
  const stroke = size >= 60 ? 6 : size >= 50 ? 5 : 4;
  const r = (size - stroke - 2) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, score)) / 100) * circ;
  const color = score >= 90 ? "var(--success)" : score >= 80 ? "var(--warning)" : "var(--destructive)";

  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF2F6" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className={`font-black text-slate-900 ${size >= 60 ? "text-lg" : "text-[10px]"}`}>{score}</span>
        {showLabel && <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ball</span>}
      </div>
    </div>
  );
}
