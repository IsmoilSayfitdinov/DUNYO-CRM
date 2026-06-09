export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      className={`relative w-11 h-6 rounded-full transition-all shrink-0 before:absolute before:-inset-y-2.5 before:inset-x-0 before:content-[''] ${value ? "bg-primary" : "bg-slate-200"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? "translate-x-5" : ""}`}
      />
    </button>
  );
}
