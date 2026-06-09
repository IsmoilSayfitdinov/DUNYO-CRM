import { Building2, Bell, Menu, Clock } from "lucide-react";
import { getInitials } from "./config";
import { GlobalSearch } from "./GlobalSearch";
import { useUnreadCount, useNotifications, useMarkAllRead } from "@/modules/notification";

const fmtTime = (iso: string) => new Date(iso).toLocaleString("uz-UZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export function Topbar({
  cfg,
  role,
  userName,
  userSubtitle,
  setSidebarOpen,
  notifOpen,
  setNotifOpen,
  navigate,
}: any) {
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: recent = [] } = useNotifications(8);
  const markAll = useMarkAllRead();

  return (
    <header className="safe-area-inset-top box-content h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center gap-1.5 sm:gap-4 px-2 sm:px-4 md:px-6 shrink-0 z-20">
      {/* Mobile menu button — 40px touch target */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden shrink-0 w-10 h-10 -ml-1 flex items-center justify-center text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
        aria-label="Menyu"
      >
        <Menu size={22} />
      </button>

      {/* Logo text on mobile */}
      <div className="lg:hidden flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#dc2626" }}>
          <Building2 size={14} className="text-white" />
        </div>
        <span className="text-sm font-bold text-slate-800 truncate">DUNYO CRM</span>
      </div>

      {/* Global qidiruv (sahifalar + xodimlar) — kichik ekranda yashirin */}
      <GlobalSearch role={role} nav={cfg.nav} className="hidden sm:flex flex-1 max-w-xs" />

      <div className="flex-1" />

      {/* Date - hidden on mobile */}
      <div className="hidden md:flex items-center gap-1.5 text-sm text-slate-400">
        <Clock size={14} />
        <span>{new Date().toLocaleDateString("uz-UZ", { weekday: "short", month: "short", day: "numeric" })}</span>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          aria-label="Bildirishnomalar"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
            <div className="absolute right-0 top-11 w-[calc(100vw-1rem)] sm:w-80 max-w-sm bg-white border border-slate-200 rounded-2xl shadow-xl z-40 overflow-hidden"
                 style={{ right: 0, maxWidth: "min(320px, calc(100vw - 1rem))" }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50">
                <div className="text-sm font-semibold text-slate-700">Bildirishnomalar</div>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{unreadCount} yangi</span>
                )}
              </div>
              <div className="divide-y divide-slate-200/30 max-h-80 overflow-y-auto">
                {recent.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">Bildirishnoma yo'q</div>
                ) : (
                  recent.map((n) => (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${!n.is_read ? "bg-slate-50/70" : ""}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? "bg-red-500" : "bg-slate-300"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!n.is_read ? "font-medium text-slate-800" : "text-slate-600"}`}>{n.title}</p>
                        {n.body && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>}
                        <p className="text-[10px] text-slate-300 mt-0.5">{fmtTime(n.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-3 border-t border-slate-200/50 flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAll.mutate()}
                    className="flex-1 text-xs text-center font-medium py-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                  >
                    Hammasini o'qilgan
                  </button>
                )}
                {role === "employee" && (
                  <button
                    onClick={() => { setNotifOpen(false); navigate("/employee/notifications"); }}
                    className="flex-1 text-xs text-center font-medium py-2 rounded-lg hover:bg-slate-100 transition-colors"
                    style={{ color: cfg.accent }}
                  >
                    Barchasini ko'rish →
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* User avatar - topbar (desktop) */}
      <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: "#dc2626" }}
        >
          {getInitials(userName)}
        </div>
        <div className="hidden xl:block min-w-0">
          <div className="text-xs font-semibold text-slate-700 leading-tight truncate">{userName}</div>
          <div className="text-[10px] text-slate-400 truncate">{userSubtitle || (role === "leader" ? "Rahbar" : "Xodim")}</div>
        </div>
      </div>
    </header>
  );
}
