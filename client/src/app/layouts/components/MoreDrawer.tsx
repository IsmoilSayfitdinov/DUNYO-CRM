import { NavLink } from "react-router";
import { LogOut } from "lucide-react";
import { getInitials } from "./config";

export function MoreDrawer({
  cfg,
  role,
  userName,
  moreItems,
  moreOpen,
  setMoreOpen,
  isActive,
  handleLogout,
}: any) {
  if (!moreOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setMoreOpen(false)}
      />
      <div
        className="fixed left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 ease-out"
        style={{ bottom: "calc(var(--bottomnav-h) + env(safe-area-inset-bottom, 0px))", maxHeight: "60vh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* User info in drawer */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground text-sm font-bold shrink-0">
            {getInitials(userName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate">{userName}</div>
            <div className="text-xs text-slate-400 capitalize">{cfg.badge}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-primary font-medium px-4 py-2.5 min-h-[40px] rounded-xl bg-red-50 border border-red-100 active:scale-95 transition-transform"
          >
            <LogOut size={13} />
            Chiqish
          </button>
        </div>

        {/* More nav items — kontentga qarab tabiiy balandlik (pastда bo'sh joy qolmaydi).
            Ko'p item bo'lsa tashqi panel 60vh'da cheklanib, shu blok scroll bo'ladi. */}
        <div className="overflow-y-auto">
          <div className="px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] grid grid-cols-2 gap-2">
            {moreItems.map((item: any) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === `/${role}`}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${
                    active
                      ? "bg-red-50 border border-red-100"
                      : "bg-slate-50 border border-slate-100 hover:bg-slate-100"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    active ? "bg-red-100" : "bg-white"
                  }`}>
                    <Icon size={18} className={active ? "text-primary" : "text-slate-500"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate ${active ? "text-red-700" : "text-slate-700"}`}>
                      {item.label}
                    </div>
                    {item.badge && (
                      <span className="text-[10px] text-red-600 font-bold">{item.badge} yangi</span>
                    )}
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
