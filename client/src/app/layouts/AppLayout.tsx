import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Outlet } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Offline } from "@/shared/ui/Offline";
import { useAuth } from "@/modules/auth";
import { useLeaveRequests } from "@/modules/leave";
import { useUnreadCount, useNotificationSocket } from "@/modules/notification";
import { Sidebar, Topbar, MobileBottomNav } from "./components";
import { Avatar, getInitials, roleConfigs } from "./components/config";
import type { Role, NavItem } from "./components/config";

export { Avatar, getInitials };

interface AppLayoutProps {
  role: Role;
}

export function AppLayout({ role }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  // Rahbar uchun kutilayotgan ta'til so'rovlari soni (real badge). Xodimда yuborilmaydi.
  const { data: leaveData } = useLeaveRequests(role === "leader");
  const leavePending = (leaveData ?? []).filter((r) => r.status === "pending").length;
  // O'qilmagan bildirishnomalar soni (har ikkala rol uchun)
  const { data: unread = 0 } = useUnreadCount();
  // Real-time WebSocket — yangi bildirishnoma kelsa darhol yangilanadi
  useNotificationSocket(true);

  // nav'ga dinamik badge'larni qo'shamiz (mock o'rniga haqiqiy son)
  const cfg = useMemo(() => {
    const base = roleConfigs[role];
    const nav = base.nav.map((it) => {
      if (role === "leader" && it.path === "/leader/leave") return { ...it, badge: leavePending || undefined };
      if (role === "employee" && it.path === "/employee/notifications") return { ...it, badge: unread || undefined };
      return it;
    });
    return { ...base, nav };
  }, [role, leavePending, unread]);

  // Haqiqiy login qilgan foydalanuvchi (auth-context'dan) — mock emas.
  const userName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.username ||
    "Foydalanuvchi";
  // Ism ostidagi yordamchi matn: @username yoki telefon
  const userSubtitle = user?.username ? `@${user.username}` : user?.phone ?? "";

  const handleLogout = () => {
    logout();        // token tozalanadi + auth holati nolga tushadi
    navigate("/");
  };

  // Bottom nav: first 4 items + "more" for mobile
  const bottomNavItems = cfg.nav.slice(0, 4);
  const moreItems = cfg.nav.slice(4);

  function isActive(item: NavItem) {
    return item.path === `/${role}`
      ? location.pathname === `/${role}` || location.pathname === `/${role}/`
      : location.pathname.startsWith(item.path);
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-[Inter,sans-serif]">
      <Offline />

      <Sidebar
        cfg={cfg}
        role={role}
        userName={userName}
        userSubtitle={userSubtitle}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isActive={isActive}
        handleLogout={handleLogout}
      />

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar
          cfg={cfg}
          role={role}
          userName={userName}
          userSubtitle={userSubtitle}
          setSidebarOpen={setSidebarOpen}
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
          navigate={navigate}
        />

        {/* PAGE CONTENT — pb-bottomnav clears the fixed mobile nav + iOS safe area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 pb-bottomnav lg:pb-0">
          {/* Sahifa o'tishlarida silliq fade + slide animatsiyasi */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileBottomNav
        cfg={cfg}
        role={role}
        userName={userName}
        bottomNavItems={bottomNavItems}
        moreItems={moreItems}
        moreOpen={moreOpen}
        setMoreOpen={setMoreOpen}
        isActive={isActive}
        handleLogout={handleLogout}
      />
    </div>
  );
}
