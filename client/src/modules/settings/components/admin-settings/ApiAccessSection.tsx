import { Key } from "lucide-react";
import { Section } from "./Section";

export function ApiAccessSection() {
  return (
    <Section title="API kirish" icon={Key}>
      <div className="space-y-3">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-slate-800">API kaliti</div>
            <span className="text-[10px] bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Faol</span>
          </div>
          <code className="text-[10px] text-slate-400 font-mono break-all bg-white p-2 rounded-lg border border-slate-200/50 block">
            dny_live_sk_••••••••••••••••••••••••••••••••••••••••••
          </code>
          <div className="flex gap-2 mt-4">
            <button className="text-xs px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-bold">
              Kalitni ko'rish
            </button>
            <button className="text-xs px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive/20 transition-all font-bold">
              Qayta yaratish
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {["Slack integratsiyasi", "Google Workspace", "Telegram Bot"].map((int) => (
            <div key={int} className="p-3 border border-slate-200 rounded-xl text-center">
              <div className="text-xs font-medium text-slate-700 mb-2">{int}</div>
              <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">Ulanmagan</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
