import { Database } from "lucide-react";
import { toast } from "sonner";
import { Section } from "./Section";

export function DataManagementSection() {
  // Backend eksport endpointi hali yo'q — foydalanuvchini chalkashtirmaslik uchun
  // tugma "tez orada" deb xabar beradi (avval hech narsa qilmasdi).
  const notReady = () => toast.info("Eksport funksiyasi hozircha mavjud emas");
  return (
    <Section title="Ma'lumotlarni boshqarish" icon={Database}>
      <div className="space-y-3">
        {[
          { label: "Barcha davomat ma'lumotlarini eksport qilish", desc: "To'liq davomat tarixini Excel formatida yuklab olish", action: "Eksport", color: "text-primary bg-primary/10 border-primary/20 hover:bg-primary/20" },
          { label: "Ish haqi ma'lumotlarini eksport qilish", desc: "Barcha oylar uchun ish haqi yozuvlarini yuklab olish", action: "Eksport", color: "text-success bg-success/10 border-success/20 hover:bg-success/20" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200/50">
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-800">{item.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
            </div>
            <button onClick={notReady} className={`shrink-0 min-h-[40px] inline-flex items-center justify-center text-xs px-4 rounded-xl font-bold border transition-all ${item.color}`}>
              {item.action}
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}
