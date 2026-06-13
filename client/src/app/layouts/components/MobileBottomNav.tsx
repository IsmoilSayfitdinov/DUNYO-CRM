import { NavLink } from "react-router";
import { Menu } from "lucide-react";
import { MoreDrawer } from "./MoreDrawer";

export function MobileBottomNav({
  cfg,
  role,
  userName,
  bottomNavItems,
  moreItems,
  moreOpen,
  setMoreOpen,
  isActive,
  handleLogout,
}: any) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-inset-bottom"
         style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.06)" }}>
      <div className="flex items-stretch min-h-[var(--bottomnav-h)]">
        {bottomNavItems.map((item: any) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${role}`}
              className="flex-1 flex flex-col items-center justify-center py-2 pt-2.5 pb-2 gap-0.5 relative transition-all"
            >
              <div className={`relative flex items-center justify-center w-10 h-7 rounded-2xl transition-all duration-200 ${
                active ? "bg-primary/10" : ""
              }`}>
                <Icon
                  size={20}
                  className={active ? "text-primary" : "text-slate-400"}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 text-[9px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center bg-primary text-primary-foreground font-bold">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold leading-tight text-center ${
                active ? "text-primary" : "text-slate-400"
              }`}>
                {item.label.length > 10 ? item.label.slice(0, 9) + "…" : item.label}
              </span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-primary" />
              )}
            </NavLink>
          );
        })}

        {/* MORE button */}
        {moreItems.length > 0 && (
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex-1 flex flex-col items-center justify-center py-2 pt-2.5 pb-2 gap-0.5 relative transition-all"
          >
            <div className={`relative flex items-center justify-center w-10 h-7 rounded-2xl transition-all duration-200 ${
              moreOpen || moreItems.some(isActive) ? "bg-primary/10" : ""
            }`}>
              <Menu
                size={20}
                className={(moreOpen || moreItems.some(isActive)) ? "text-primary" : "text-slate-400"}
                strokeWidth={1.8}
              />
            </div>
            <span className={`text-[10px] font-semibold leading-tight ${
              moreOpen || moreItems.some(isActive) ? "text-primary" : "text-slate-400"
            }`}>
              Ko'proq
            </span>
            {moreItems.some(isActive) && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-primary" />
            )}
          </button>
        )}
      </div>

      {/* MORE drawer - slides up */}
      <MoreDrawer
        cfg={cfg}
        role={role}
        userName={userName}
        moreItems={moreItems}
        moreOpen={moreOpen}
        setMoreOpen={setMoreOpen}
        isActive={isActive}
        handleLogout={handleLogout}
      />
    </nav>
  );
}
