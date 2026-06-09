import React from "react";
import {
  LayoutDashboard, Users, Calendar,
  Settings, Bell,
  DollarSign, FileText,
  QrCode, ClipboardList,
  BarChart2, UserCheck, AlertTriangle, CheckSquare,
  User, Scan, ScanBarcode, MapPin
} from "lucide-react";

export type Role = "leader" | "employee";

export interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

export function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function Avatar({ name, size = 32, color }: { name: string; size?: number; color?: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        background: color ?? "linear-gradient(135deg, #ef4444 0%, #dc2626 55%, #991b1b 100%)",
      }}
      className="rounded-full flex items-center justify-center text-white font-bold select-none shadow-sm ring-2 ring-white"
    >
      <span style={{ fontSize: size * 0.4 }} className="tracking-tight">{getInitials(name)}</span>
    </div>
  );
}

const leaderNav: NavItem[] = [
  { label: "Boshqaruv paneli", path: "/leader", icon: LayoutDashboard },
  { label: "Xodimlarni boshqarish", path: "/leader/staff", icon: Users },
  { label: "Filiallar", path: "/leader/branches", icon: MapPin },
  { label: "Bugungi davomat", path: "/leader/today", icon: UserCheck },
  { label: "Davomat jurnali", path: "/leader/records", icon: ClipboardList },
  { label: "Davomat tahlili", path: "/leader/attendance", icon: Calendar },
  { label: "Ish haqi tahlili", path: "/leader/salary", icon: DollarSign },
  { label: "Vazifalar", path: "/leader/tasks", icon: CheckSquare },
  { label: "Rahbar eslatmalari", path: "/leader/reminders", icon: AlertTriangle },
  { label: "Ta'til so'rovlari", path: "/leader/leave", icon: FileText },
  { label: "Hisobotlar", path: "/leader/reports", icon: ClipboardList },
  { label: "Sozlamalar", path: "/leader/settings", icon: Settings },

];

const employeeNav: NavItem[] = [
  { label: "Boshqaruv paneli", path: "/employee", icon: LayoutDashboard },
  { label: "Mening profilim", path: "/employee/profile", icon: User },
  { label: "Skaner", path: "/employee/scanner", icon: Scan },
  { label: "Mahsulot topish", path: "/employee/products", icon: ScanBarcode },
  { label: "Davomat tarixi", path: "/employee/attendance", icon: Calendar },
  { label: "Ish haqi", path: "/employee/salary", icon: DollarSign },
  { label: "Ta'tillar", path: "/employee/leave", icon: FileText },
  { label: "Vazifalar", path: "/employee/tasks", icon: CheckSquare },
  { label: "Bildirishnomalar", path: "/employee/notifications", icon: Bell },
  { label: "Sozlamalar", path: "/employee/settings", icon: Settings },
];

export const roleConfigs = {
  leader: {
    nav: leaderNav,
    label: "Boshqaruv paneli",
    sublabel: "Boshqaruv va tahlil",
    accent: "#dc2626",
    accentLight: "rgba(220, 38, 38, 0.08)",
    badge: "ADMIN",
    badgeBg: "bg-red-600",
  },
  employee: {
    nav: employeeNav,
    label: "Xodim Portali",
    sublabel: "Shaxsiy profil va davomat",
    accent: "#dc2626",
    accentLight: "rgba(220, 38, 38, 0.08)",
    badge: "USER",
    badgeBg: "bg-red-600",
  },
};

export const notifications = [
  { id: 1, text: "QR kod dublikati aniqlandi", sub: "Bobur Rakhimov · 28 daqiqa oldin", dot: "bg-red-500", unread: true },
  { id: 2, text: "Ta'til so'rovi kutilmoqda", sub: "Jasur Toshmatov · 1 soat oldin", dot: "bg-amber-500", unread: true },
  { id: 3, text: "Mart oyi ish haqi hisoblandi", sub: "Tizim · 3 soat oldin", dot: "bg-emerald-500", unread: false },
];
