import { useState, useEffect } from "react";
import { Bell, BellRing, Calendar, DollarSign, FileText, CheckSquare, MessageSquare, Check } from "lucide-react";
import { toast } from "sonner";
import { useNotifications, useMarkRead, useMarkAllRead, subscribeToPush, isPushSubscribed, pushSupported, sendTestPush } from "@/modules/notification";
import { MyRemindersCard } from "@/modules/reminder";
import { EmptyState } from "@/shared/ui/EmptyState";

const mk = (icon: any, color: string) => ({ icon, color, bg: `color-mix(in srgb, ${color}, transparent 88%)` });

const typeIcon: Record<string, { icon: any; color: string; bg: string }> = {
  attendance: mk(Calendar, "#3b82f6"),
  salary: mk(DollarSign, "#16a34a"),
  leave: mk(FileText, "#f59e0b"),
  task: mk(CheckSquare, "#8b5cf6"),
  system: mk(MessageSquare, "var(--primary)"),
};

const fmt = (iso: string) => new Date(iso).toLocaleString("uz-UZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export function Notifications() {
  const { data: notifs = [], isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const [tab, setTab] = useState<"Barchasi" | "O'qilmagan">("Barchasi");

  const filtered = tab === "O'qilmagan" ? notifs.filter((n) => !n.is_read) : notifs;
  const unreadCount = notifs.filter((n) => !n.is_read).length;

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Bell size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Bildirishnomalar</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {unreadCount > 0 ? `${unreadCount} ta o'qilmagan` : "Barchasi o'qilgan ✓"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {unreadCount > 0 && (
            <button onClick={() => markAll.mutate()} disabled={markAll.isPending}
              className="flex items-center justify-center gap-2 text-sm text-success hover:bg-success/10 transition-all font-semibold px-3 py-2 rounded-xl border border-success/20 flex-1 sm:flex-none disabled:opacity-60">
              <Check size={15} /> Barchasini o'qilgan
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-2xl p-1 w-full sm:w-fit">
        {(["Barchasi", "O'qilmagan"] as const).map((ti) => (
          <button key={ti} onClick={() => setTab(ti)}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${tab === ti ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {ti}
            {ti === "O'qilmagan" && unreadCount > 0 && (
              <span className="ml-2 bg-destructive/10 text-destructive text-[10px] px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Rahbar eslatmalari (bo'sh bo'lsa ko'rinmaydi) */}
      <MyRemindersCard />

      {/* List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <EmptyState variant="loading" title="Yuklanmoqda…" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <EmptyState
            icon={Bell}
            title="Bildirishnoma yo'q"
            description={tab === "O'qilmagan" ? "Hammasi o'qilgan!" : "Hozircha sizga hech qanday bildirishnoma kelmagan."}
          />
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((notif) => {
            const cfg = typeIcon[notif.type ?? "system"] || typeIcon.system;
            const Icon = cfg.icon;
            return (
              <button
                key={notif.id}
                onClick={() => { if (!notif.is_read) markRead.mutate(notif.id); }}
                className={`w-full flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border text-left group ${
                  !notif.is_read ? "bg-white border-primary/20 shadow-md shadow-primary/5" : "bg-white border-slate-200/60 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105" style={{ background: cfg.bg }}>
                  <Icon size={20} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-bold text-slate-900 text-sm sm:text-[15px] leading-snug">{notif.title}</div>
                    {!notif.is_read && <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1" />}
                  </div>
                  {notif.body && <p className="text-[13px] sm:text-sm text-slate-500 mt-1 leading-relaxed">{notif.body}</p>}
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{fmt(notif.created_at)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
