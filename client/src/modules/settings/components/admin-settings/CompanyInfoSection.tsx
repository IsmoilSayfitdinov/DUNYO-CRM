import { Building2, Save, Globe, Mail, Phone, Clock, Users } from "lucide-react";
import { Section } from "./Section";

interface Props {
  saved: boolean;
  onSave: () => void;
  accentClass: string;
}

export function CompanyInfoSection({ saved, onSave, accentClass }: Props) {
  return (
    <Section title="Kompaniya ma'lumotlari" icon={Building2}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Kompaniya nomi", value: "DUNYO LLC", icon: Building2 },
          { label: "Soha", value: "Texnologiya va Dasturiy ta'minot", icon: Globe },
          { label: "Elektron pochta", value: "hr@dunyo.uz", icon: Mail },
          { label: "Telefon raqami", value: "+998 71 200-0000", icon: Phone },
          { label: "Ish vaqti", value: "09:00 – 18:00 (Dush–Jum)", icon: Clock },
          { label: "Xodimlar soni", value: `10 ta xodim`, icon: Users },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label}>
              <label className="text-xs font-medium text-slate-400 block mb-1">{item.label}</label>
              <div className="relative">
                <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  defaultValue={item.value}
                  className="w-full pl-8 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-slate-400"
                />
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={onSave} className={`mt-5 flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all ${accentClass} active:scale-[0.98]`}>
        <Save size={15} /> {saved ? "Saqlandi" : "O'zgarishlarni saqlash"}
      </button>
    </Section>
  );
}
