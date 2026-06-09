import React from "react";

type StatusType =
  | "Present" | "Absent" | "Late" | "On Leave" | "Checked In" | "Checked Out" | "Currently Working"
  | "Paid" | "Unpaid"
  | "Approved" | "Rejected" | "Pending"
  | "Warning" | "Critical" | "Verified"
  | "QR" | "Face" | "Manual"
  | "Success" | "Failed" | "Duplicate"
  | "New" | "In Progress" | "Done" | "Overdue"
  | "High" | "Medium" | "Low" | "Critical Priority"
  | "Active" | "Inactive"
  | string;

const statusConfig: Record<string, { bg: string; text: string; dot?: string }> = {
  Present:          { bg: "bg-emerald-50",    text: "text-emerald-700",  dot: "bg-success" },
  Absent:           { bg: "bg-red-50",        text: "text-red-700",      dot: "bg-destructive" },
  Late:             { bg: "bg-amber-50",      text: "text-amber-700",    dot: "bg-warning" },
  "On Leave":       { bg: "bg-primary/10",    text: "text-primary",      dot: "bg-primary" },
  "Checked In":     { bg: "bg-emerald-50",    text: "text-emerald-700",  dot: "bg-success" },
  "Checked Out":    { bg: "bg-slate-100",     text: "text-slate-600",    dot: "bg-slate-400" },
  "Currently Working": { bg: "bg-emerald-50", text: "text-emerald-700",  dot: "bg-success" },
  Paid:             { bg: "bg-emerald-50",    text: "text-emerald-700",  dot: "bg-success" },
  Unpaid:           { bg: "bg-red-50",        text: "text-red-700",      dot: "bg-destructive" },
  Approved:         { bg: "bg-emerald-50",    text: "text-emerald-700",  dot: "bg-success" },
  Rejected:         { bg: "bg-red-50",        text: "text-red-700",      dot: "bg-destructive" },
  Pending:          { bg: "bg-amber-50",      text: "text-amber-700",    dot: "bg-warning" },
  Warning:          { bg: "bg-orange-50",     text: "text-orange-700",   dot: "bg-warning" },
  Critical:         { bg: "bg-red-50",        text: "text-red-700",      dot: "bg-destructive" },
  Verified:         { bg: "bg-emerald-50",    text: "text-emerald-700",  dot: "bg-success" },
  QR:               { bg: "bg-primary/10",    text: "text-primary",      dot: "bg-primary" },
  Face:             { bg: "bg-rose-50",     text: "text-rose-700",   dot: "bg-rose-500" },
  Manual:           { bg: "bg-slate-100",     text: "text-slate-600",    dot: "bg-slate-400" },
  Success:          { bg: "bg-emerald-50",    text: "text-emerald-700",  dot: "bg-success" },
  Failed:           { bg: "bg-red-50",        text: "text-red-700",      dot: "bg-destructive" },
  Duplicate:        { bg: "bg-red-50",        text: "text-red-700",      dot: "bg-destructive" },
  New:              { bg: "bg-primary/10",    text: "text-primary",      dot: "bg-primary" },
  "In Progress":    { bg: "bg-primary/10",    text: "text-primary",      dot: "bg-primary" },
  Done:             { bg: "bg-emerald-50",    text: "text-emerald-700",  dot: "bg-success" },
  Overdue:          { bg: "bg-red-50",        text: "text-red-700",      dot: "bg-destructive" },
  High:             { bg: "bg-orange-50",     text: "text-orange-700",   dot: "bg-warning" },
  Medium:           { bg: "bg-primary/10",    text: "text-primary",      dot: "bg-primary-foreground/40" },
  Low:              { bg: "bg-slate-100",     text: "text-slate-600",    dot: "bg-slate-400" },
  "Critical Priority": { bg: "bg-red-50",    text: "text-red-700",      dot: "bg-destructive" },
  Active:           { bg: "bg-emerald-50",    text: "text-emerald-700",  dot: "bg-success" },
  Inactive:         { bg: "bg-slate-100",     text: "text-slate-600",    dot: "bg-slate-400" },
  "Pending Verification": { bg: "bg-amber-50", text: "text-amber-700",  dot: "bg-warning" },
  // Davomat (o'zbekcha — backenddan ATTENDANCE_BADGE orqali keladi)
  Keldi:            { bg: "bg-emerald-50",    text: "text-emerald-700",  dot: "bg-success" },
  Kechikdi:         { bg: "bg-amber-50",      text: "text-amber-700",    dot: "bg-warning" },
  Kelmadi:          { bg: "bg-red-50",        text: "text-red-700",      dot: "bg-destructive" },
  Sababli:          { bg: "bg-amber-50",      text: "text-amber-700",    dot: "bg-amber-500" },
  "Ta'tilda":       { bg: "bg-blue-50",       text: "text-blue-700",     dot: "bg-blue-500" },
};

const statusLabels: Record<string, string> = {
  Present: "Kelgan",
  Absent: "Kelmagan",
  Late: "Kechikkan",
  "On Leave": "Ta'tilda",
  "Checked In": "Kirilgan",
  "Checked Out": "Chiqilgan",
  "Currently Working": "Hozir ishda",
  Paid: "To'langan",
  Unpaid: "To'lanmagan",
  Approved: "Tasdiqlangan",
  Rejected: "Rad etilgan",
  Pending: "Kutilmoqda",
  Warning: "Ogohlantirish",
  Critical: "Kritik",
  Verified: "Tasdiqlangan",
  QR: "QR",
  Face: "Yuz",
  Manual: "Qo'lda",
  Success: "Muvaffaqiyatli",
  Failed: "Muvaffaqiyatsiz",
  Duplicate: "Dublikat",
  New: "Yangi",
  "In Progress": "Jarayonda",
  Done: "Bajarildi",
  Overdue: "Muddati o'tgan",
  High: "Yuqori",
  Medium: "O'rta",
  Low: "Past",
  "Critical Priority": "Juda muhim",
  Active: "Faol",
  Inactive: "Faol emas",
  "Pending Verification": "Tasdiqlash kutilmoqda",
};

interface StatusBadgeProps {
  status: StatusType;
  showDot?: boolean;
  size?: "sm" | "md";
}

export function StatusBadge({ status, showDot = true, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status as string] || { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";
  
  const localizedStatus = statusLabels[status as string] || status;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${config.bg} ${config.text} ${padding} font-medium whitespace-nowrap`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />}
      {localizedStatus}
    </span>
  );
}

export function MethodBadge({ method }: { method: string }) {
  return <StatusBadge status={method as StatusType} showDot={false} />;
}
