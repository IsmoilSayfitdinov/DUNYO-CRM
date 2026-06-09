import { useEffect, useState } from "react";
import { Bell, Shield, Monitor, Lock, Smartphone, Save, BellRing } from "lucide-react";
import { toast } from "sonner";
import { useSettings, useUpdateSettings } from "../hooks/use-settings";
import { ChangePasswordModal } from "../components/ChangePasswordModal";
import { SessionsList } from "../components/SessionsList";
import { subscribeToPush, isPushSubscribed, pushSupported, sendTestPush } from "@/modules/notification";

// iOS aniqlash — iPhone/iPad'да push faqat "Bosh ekranga qo'shilgan" (standalone) ilovada ishlaydi.
const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
const isIOS = /iphone|ipad|ipod/i.test(ua);
const isStandalone =
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true);

export function Settings() {
  const { data: settings, isLoading } = useSettings();
  const { mutate, isPending } = useUpdateSettings();
  const [pwOpen, setPwOpen] = useState(false);

  // Bildirishnoma toggle'lari — serverdan kelgan qiymatlar bilan boshlanadi,
  // "Saqlash" tugmasi bilan birga PATCH qilinadi.
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [leaveNotif, setLeaveNotif] = useState(true);
  const [salaryNotif, setSalaryNotif] = useState(true);
  const [taskNotif, setTaskNotif] = useState(false);
  const [attendanceNotif, setAttendanceNotif] = useState(true);
  const [saved, setSaved] = useState(false);

  // Bu qurilma push'ga obuna bo'lganmi (Web Push — Android/iOS/desktop)
  const [deviceOn, setDeviceOn] = useState(false);
  const [deviceBusy, setDeviceBusy] = useState(false);
  useEffect(() => { isPushSubscribed().then(setDeviceOn).catch(() => {}); }, []);

  const enableDevicePush = async () => {
    setDeviceBusy(true);
    try {
      await subscribeToPush();
      setDeviceOn(true);
      toast.success("Bu qurilmada push yoqildi");
    } catch (e: any) {
      toast.error(e?.message ?? "Push'ni yoqib bo'lmadi");
    } finally {
      setDeviceBusy(false);
    }
  };

  const testDevicePush = async () => {
    setDeviceBusy(true);
    try {
      await sendTestPush();
      toast.success("Test bildirishnoma yuborildi — qurilmangizni tekshiring");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Test yuborib bo'lmadi");
    } finally {
      setDeviceBusy(false);
    }
  };

  useEffect(() => {
    if (settings) {
      setSmsNotif(settings.notify_sms);
      setPushNotif(settings.notify_push);
      setLeaveNotif(settings.notify_leave);
      setSalaryNotif(settings.notify_salary);
      setTaskNotif(settings.notify_task);
      setAttendanceNotif(settings.notify_attendance);
    }
  }, [settings]);

  const handleSave = () => {
    mutate(
      {
        notify_sms: smsNotif,
        notify_push: pushNotif,
        notify_leave: leaveNotif,
        notify_salary: salaryNotif,
        notify_task: taskNotif,
        notify_attendance: attendanceNotif,
      },
      {
        onSuccess: () => {
          setSaved(true);
          toast.success("Sozlamalar saqlandi");
          setTimeout(() => setSaved(false), 2000);
        },
      },
    );
  };

  // 2FA tugmasi — darhol saqlanadi
  const twoFactor = settings?.two_factor_enabled ?? false;
  const toggleTwoFactor = () => mutate({ two_factor_enabled: !twoFactor });

  function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        className={`relative w-11 h-6 rounded-full transition-all shrink-0 before:absolute before:-inset-y-2.5 before:inset-x-0 before:content-[''] ${value ? "bg-primary" : "bg-slate-200"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? "translate-x-5" : ""}`} />
      </button>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 ">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Sozlamalar</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Hisobingiz va bildirishnomalarni boshqarish</p>
      </div>

      {/* Notification preferences */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5">
        <div className="flex items-center gap-2 mb-5">
          <Bell size={18} className="text-slate-400" />
          <h3 className="font-semibold text-slate-900">Bildirishnoma sozlamalari</h3>
        </div>

        {/* Qurilma push (Telegram/Instagram kabi — ilova yopiq bo'lsa ham keladi) */}
        <div className="mb-5 p-3 sm:p-4 rounded-xl border border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <BellRing size={18} className="text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">Bu qurilmada push xabarnoma</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {deviceOn ? "Yoqilgan ✓ — ilova yopiq bo'lsa ham xabar keladi" : "Telefon/kompyuter ekranida xabar ko'rsatish"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!deviceOn ? (
                <button onClick={enableDevicePush} disabled={deviceBusy || !pushSupported()}
                  className="inline-flex items-center gap-2 text-sm text-primary font-bold px-3 py-2 rounded-xl border border-primary/30 hover:bg-primary/10 transition-all disabled:opacity-50">
                  <BellRing size={15} /> {deviceBusy ? "Yoqilmoqda…" : "Yoqish"}
                </button>
              ) : (
                <button onClick={testDevicePush} disabled={deviceBusy}
                  className="inline-flex items-center gap-2 text-sm text-primary font-bold px-3 py-2 rounded-xl border border-primary/30 hover:bg-primary/10 transition-all disabled:opacity-50">
                  <BellRing size={15} /> {deviceBusy ? "Yuborilmoqda…" : "Test push"}
                </button>
              )}
            </div>
          </div>
          {/* iOS: faqat o'rnatilgan (standalone) ilovada push ishlaydi */}
          {isIOS && !isStandalone && (
            <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 leading-relaxed">
              <b>iPhone/iPad:</b> push ishlashi uchun avval Safari'да <b>Ulashish (⬆️) → "Bosh ekranga qo'shish"</b> qiling,
              so'ng ilovani <b>bosh ekrandagi ikonkadan</b> oching va shu yerда "Yoqish"ни bosing. (iOS 16.4+)
            </div>
          )}
          {!pushSupported() && !isIOS && (
            <div className="mt-3 text-xs text-slate-500">Bu brauzer push'ni qo'llab-quvvatlamaydi.</div>
          )}
        </div>

        <div className="space-y-4">
          {[
            { label: "SMS bildirishnomalar", desc: "Muhim xabarlarni SMS orqali yuborish", value: smsNotif, onChange: setSmsNotif },
            { label: "Push bildirishnomalar (master)", desc: "Barcha qurilma push'larini yoqish/o'chirish", value: pushNotif, onChange: setPushNotif },
            { label: "Ta'til so'rovlari", desc: "So'rov holati o'zgarganda push", value: leaveNotif, onChange: setLeaveNotif },
            { label: "Maosh / ish haqi", desc: "Oylik tasdiqlanganda push", value: salaryNotif, onChange: setSalaryNotif },
            { label: "Davomat", desc: "Kelish/ketish, kechikish haqida push", value: attendanceNotif, onChange: setAttendanceNotif },
            { label: "Yangi vazifalar", desc: "Yangi vazifa biriktirilganda push", value: taskNotif, onChange: setTaskNotif },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 py-3 border-b border-slate-200/30 last:border-0">
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-800">{item.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
              </div>
              <Toggle value={item.value} onChange={item.onChange} />
            </div>
          ))}
        </div>
        <button onClick={handleSave} disabled={isPending || isLoading} className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
          <Save size={14} />
          {isPending ? "Saqlanmoqda..." : saved ? "Saqlandi!" : "Sozlamalarni saqlash"}
        </button>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} className="text-slate-400" />
          <h3 className="font-semibold text-slate-900">Xavfsizlik</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200/50">
            <div className="flex items-center gap-3 min-w-0">
              <Lock size={16} className="text-slate-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-800">Parol</div>
                <div className="text-xs text-slate-400">Hisobingiz parolini yangilash</div>
              </div>
            </div>
            <button onClick={() => setPwOpen(true)} className="shrink-0 min-h-[40px] inline-flex items-center justify-center text-xs bg-white text-slate-900 border border-slate-200 px-3 rounded-lg hover:bg-slate-100 transition-colors">
              O'zgartirish
            </button>
          </div>
          <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200/50">
            <div className="flex items-center gap-3 min-w-0">
              <Smartphone size={16} className="text-slate-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-800">Ikki bosqichli autentifikatsiya</div>
                <div className="text-xs text-slate-400">{twoFactor ? "Hozirda yoqilgan" : "Hozirda o'chirilgan"}</div>
              </div>
            </div>
            <button onClick={toggleTwoFactor} disabled={isPending} className="shrink-0 min-h-[40px] inline-flex items-center justify-center text-xs bg-primary text-primary-foreground px-4 rounded-xl hover:opacity-90 transition-all font-bold disabled:opacity-60">
              {twoFactor ? "O'chirish" : "Yoqish"}
            </button>
          </div>
        </div>
      </div>

      {/* Active sessions */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5">
        <div className="flex items-center gap-2 mb-5">
          <Monitor size={18} className="text-slate-400" />
          <h3 className="font-semibold text-slate-900">Faol seanslar</h3>
        </div>
        <SessionsList />
      </div>

      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  );
}
