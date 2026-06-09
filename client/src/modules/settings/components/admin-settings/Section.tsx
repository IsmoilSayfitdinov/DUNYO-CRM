import React from "react";

export function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <Icon size={18} className="text-slate-400 shrink-0" />
        <h3 className="font-semibold text-slate-900 text-sm sm:text-base">{title}</h3>
      </div>
      {children}
    </div>
  );
}
