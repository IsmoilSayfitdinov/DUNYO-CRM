import { NavLink } from "react-router";
import { Building2, LogOut, X } from "lucide-react";
import { getInitials } from "./config";

export function Sidebar({
  cfg,
  role,
  userName,
  userSubtitle,
  sidebarOpen,
  setSidebarOpen,
  isActive,
  handleLogout,
}: any) {
  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col
          transition-transform duration-300
          lg:relative lg:translate-x-0 lg:flex
          w-[260px] sm:w-[280px]
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ background: "#1a1215" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 sm:px-5 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <Building2 size={16} className="text-primary-foreground" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm leading-tight">DUNYO CRM</div>
              <div className="text-xs leading-tight mt-0.5 text-slate-500">{cfg.sublabel}</div>
            </div>
          </div>
          {/* Close button - only on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-10 h-10 -mr-1 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            aria-label="Yopish"
          >
            <X size={20} />
          </button>
        </div>

        {/* User info - inside sidebar */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-primary/10">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold shrink-0">
              {getInitials(userName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">{userName}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.5 rounded-md text-white/60 font-medium text-[10px] uppercase tracking-wider shrink-0"
                      style={{ background: "rgba(255,255,255,0.07)" }}>
                  {cfg.badge}
                </span>
                {userSubtitle && (
                  <span className="text-[11px] text-slate-400 truncate">{userSubtitle}</span>
                )}
              </div>
            </div>
            <button onClick={handleLogout} aria-label="Chiqish" className="w-10 h-10 flex items-center justify-center shrink-0 text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5 mt-3">
          {cfg.nav.map((item: any) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/${role}`}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${
                  active
                    ? "text-white bg-primary/15"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-primary" />
                )}
                <Icon size={16} className={active ? "text-red-400" : undefined} />
                <span className="text-sm flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-xs rounded-full px-1.5 py-0.5 bg-primary text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom logout */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            <span className="text-sm">Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
