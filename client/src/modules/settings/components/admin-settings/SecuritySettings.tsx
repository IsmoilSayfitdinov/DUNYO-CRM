import { useState } from "react";
import { Shield } from "lucide-react";
import { Section } from "./Section";
import { Toggle } from "./Toggle";
import { ChangePasswordModal } from "../ChangePasswordModal";

interface Props {
  isLeader: boolean;
  autoLockout: boolean; setAutoLockout: (v: boolean) => void;
  twoFactor: boolean; setTwoFactor: (v: boolean) => void;
  auditEnabled: boolean; setAuditEnabled: (v: boolean) => void;
}

export function SecuritySettings({
  isLeader,
  autoLockout, setAutoLockout,
  twoFactor, setTwoFactor,
  auditEnabled, setAuditEnabled,
}: Props) {
  const [pwOpen, setPwOpen] = useState(false);
  return (
    <Section title="Xavfsizlik" icon={Shield}>
      <div className="space-y-3">
        {[
          { label: "Avtomatik chiqish", desc: "30 daqiqa harakatsizlikdan so'ng hisobdan chiqish", value: autoLockout, onChange: setAutoLockout },
          { label: "Ikki bosqichli autentifikatsiya", desc: "Kirishda 2FA kodini talab qilish", value: twoFactor, onChange: setTwoFactor },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200/50">
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-800">{item.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
            </div>
            <Toggle value={item.value} onChange={item.onChange} />
          </div>
        ))}

        <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200/50 mt-2">
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-800">Parolni o'zgartirish</div>
            <div className="text-xs text-slate-400 mt-0.5">Hisobingiz parolini yangilash</div>
          </div>
          <button onClick={() => setPwOpen(true)} className="shrink-0 min-h-[40px] inline-flex items-center justify-center text-xs bg-white text-slate-900 border border-slate-200 px-3 rounded-lg hover:bg-slate-100 transition-colors">
            Yangilash
          </button>
        </div>
      </div>

      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </Section>
  );
}
