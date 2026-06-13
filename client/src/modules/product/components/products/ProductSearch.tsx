import { Search } from "lucide-react";

interface Props {
  manualQuery: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export function ProductSearch({ manualQuery, onChange, onSearch }: Props) {
  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={manualQuery}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="Barkod yoki nom kiriting..."
          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all"
        />
      </div>
      <button
        onClick={onSearch}
        className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors active:scale-[0.98]"
      >
        Qidirish
      </button>
    </div>
  );
}
