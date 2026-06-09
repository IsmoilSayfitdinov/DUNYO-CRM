import { Bell, Save } from "lucide-react";
import { Section } from "./Section";
import { Toggle } from "./Toggle";

interface Props {
  isLeader: boolean;
  emailAlerts: boolean; setEmailAlerts: (v: boolean) => void;
  smsAlerts: boolean; setSmsAlerts: (v: boolean) => void;
  pushAlerts: boolean; setPushAlerts: (v: boolean) => void;
  taskAlerts: boolean; setTaskAlerts: (v: boolean) => void;
  duplicateQR: boolean; setDuplicateQR: (v: boolean) => void;
  lowAttendance: boolean; setLowAttendance: (v: boolean) => void;
  payrollReady: boolean; setPayrollReady: (v: boolean) => void;
  leaveNotif: boolean; setLeaveNotif: (v: boolean) => void;
  manualEntryAlert: boolean; setManualEntryAlert: (v: boolean) => void;
  saved: boolean;
  onSave: () => void;
  accentClass: string;
}

export function NotificationSettings({
  isLeader,
  emailAlerts, setEmailAlerts,
  smsAlerts, setSmsAlerts,
  pushAlerts, setPushAlerts,
  taskAlerts, setTaskAlerts,
  duplicateQR, setDuplicateQR,
  lowAttendance, setLowAttendance,
  payrollReady, setPayrollReady,
  leaveNotif, setLeaveNotif,
  manualEntryAlert, setManualEntryAlert,
  saved, onSave, accentClass,
}: Props) {
  return (
    <Section title="Bildirishnoma sozlamalari" icon={Bell}>
      <div className="space-y-4">
        {[
          { label: "SMS xabarnomalar", desc: "Muhim xabarlarni telefon raqamiga SMS orqali yuborish", value: smsAlerts, onChange: setSmsAlerts },
          { label: "Push bildirishnomalar", desc: "Brauzerda tezkor xabarlarni ko'rsatish", value: pushAlerts, onChange: setPushAlerts },
          { label: "Ish haqi hisobi", desc: "Oylik ish haqi hisoboti tayyor bo'lganda bildirishnoma", value: payrollReady, onChange: setPayrollReady },
          { label: "Ta'til so'rovlari", desc: "Yangi ta'til so'rovlari kelganda xabar berish", value: leaveNotif, onChange: setLeaveNotif },
          { label: "Yangi vazifalar", desc: "Yangi vazifa biriktirilganda xabar berish", value: taskAlerts, onChange: setTaskAlerts },
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
      <button onClick={onSave} className={`mt-4 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all ${accentClass} active:scale-[0.98]`}>
        <Save size={15} /> {saved ? "Saqlandi" : "Xabarnomalarni saqlash"}
      </button>
    </Section>
  );
}
