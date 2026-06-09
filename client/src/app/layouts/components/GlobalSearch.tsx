import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, X, FileText, User as UserIcon } from "lucide-react";
import { useEmployees } from "@/modules/employee";
import { getInitials, type NavItem } from "./config";

interface GlobalSearchProps {
  role: "leader" | "employee";
  nav: NavItem[];
  /** mobil drawer ichida ham ishlatsa bo'lsin — tashqi className */
  className?: string;
}

const norm = (s: string) => s.toLowerCase().trim();

/**
 * Topbar global qidiruvi: yozilgan matnga ko'ra
 *  1) menyu sahifalari (har ikki rol uchun)
 *  2) xodimlar (faqat rahbarda — ism bo'yicha)
 * topiladi; natija bosilsa tegishli sahifaga o'tadi.
 */
export function GlobalSearch({ role, nav, className }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Xodimlar faqat rahbarga va faqat qidiruv ochilganda yuklanadi (keraksiz so'rov yo'q).
  const { data: employeesPage } = useEmployees(
    role === "leader" && query.length > 0 ? { limit: 100 } : undefined
  );
  const employees = employeesPage?.items ?? [];

  const q = norm(query);

  const pageMatches = useMemo(
    () => (q ? nav.filter((it) => norm(it.label).includes(q)).slice(0, 6) : []),
    [q, nav]
  );

  const employeeMatches = useMemo(() => {
    if (!q || role !== "leader") return [];
    return employees
      .map((e) => ({
        id: e.id,
        name: [e.user?.first_name, e.user?.last_name].filter(Boolean).join(" ").trim() || e.user?.username || "Noma'lum",
        position: e.position,
      }))
      .filter((e) => norm(e.name).includes(q) || (e.position && norm(e.position).includes(q)))
      .slice(0, 6);
  }, [q, role, employees]);

  const hasResults = pageMatches.length > 0 || employeeMatches.length > 0;

  // Tashqariga bosilganda yopish
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  return (
    <div ref={boxRef} className={`relative ${className ?? ""}`}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-transparent transition-all"
        placeholder={role === "leader" ? "Sahifa yoki xodim qidirish..." : "Sahifa qidirish..."}
      />
      {query && (
        <button
          onClick={() => { setQuery(""); setOpen(false); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Tozalash"
        >
          <X size={14} />
        </button>
      )}

      {open && query.length > 0 && (
        <div className="absolute left-0 right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto">
          {!hasResults && (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              "{query}" bo'yicha hech narsa topilmadi
            </div>
          )}

          {pageMatches.length > 0 && (
            <div className="py-1.5">
              <div className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Sahifalar</div>
              {pageMatches.map((it) => {
                const Icon = it.icon ?? FileText;
                return (
                  <button
                    key={it.path}
                    onClick={() => go(it.path)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left transition-colors"
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-slate-500" />
                    </span>
                    <span className="text-sm text-slate-700 truncate">{it.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {employeeMatches.length > 0 && (
            <div className="py-1.5 border-t border-slate-100">
              <div className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Xodimlar</div>
              {employeeMatches.map((e) => (
                <button
                  key={e.id}
                  onClick={() => go(`/leader/employees/${e.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left transition-colors"
                >
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: "#dc2626" }}>
                    {getInitials(e.name)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-slate-700 truncate">{e.name}</span>
                    {e.position && <span className="block text-xs text-slate-400 truncate">{e.position}</span>}
                  </span>
                  <UserIcon size={13} className="text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
