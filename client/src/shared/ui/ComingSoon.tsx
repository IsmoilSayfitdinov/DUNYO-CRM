import type { ComponentType, ReactNode } from "react";
import { Rocket, Sparkles } from "lucide-react";

interface Props {
  children: ReactNode;
  label?: string;
  note?: string;
}

/**
 * Tayyor bo'lmagan (ishlab chiqilayotgan) bo'limlar uchun "Tez orada" qoplama.
 * Asl UI orqada xira (frosted) ko'rinib turadi, lekin bosib bo'lmaydi.
 */
export function ComingSoon({ children, label = "Tez orada", note }: Props) {
  return (
    <div className="relative min-h-[70vh]">
      {/* Asl UI — ko'rinadi, lekin interaktiv emas */}
      <div className="pointer-events-none select-none blur-[1px] opacity-90" aria-hidden="true">
        {children}
      </div>

      {/* Frosted qatlam */}
      <div className="absolute inset-0 z-20 flex items-start justify-center px-4 pt-[15vh] backdrop-blur-md bg-gradient-to-b from-white/55 via-white/45 to-white/55">
        {/* Markaziy karta */}
        <div className="relative w-full max-w-sm rounded-3xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-2xl ring-1 ring-black/5 px-8 py-9 text-center animate-in fade-in zoom-in-95 duration-500">
          {/* Yumshoq glow */}
          <div className="pointer-events-none absolute -inset-1 -z-10 rounded-[1.75rem] bg-gradient-to-tr from-primary/25 via-rose-300/20 to-transparent blur-2xl opacity-70" />

          {/* Ikonka + pulsatsiya halqasi */}
          <div className="relative mx-auto mb-5 w-16 h-16">
            <span className="absolute inset-0 rounded-2xl bg-primary/25 animate-ping" />
            <span className="absolute -inset-2 rounded-3xl bg-primary/10 blur-md" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <Rocket size={28} />
            </div>
          </div>

          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-primary bg-primary/10 border border-primary/15 px-3 py-1 rounded-full mb-3">
            <Sparkles size={11} /> Ishlab chiqilmoqda
          </span>

          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">{label}</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {note ?? "Bu bo'lim hozircha ishlab chiqilmoqda. Tez kunda foydalanishingiz mumkin bo'ladi."}
          </p>

          {/* Jonli nuqtalar */}
          <div className="mt-5 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Route'da sahifani "Tez orada" qoplama bilan o'rashga yordamchi. */
export function withComingSoon<P extends object>(Comp: ComponentType<P>, note?: string): ComponentType<P> {
  return (props: P) => (
    <ComingSoon note={note}>
      <Comp {...props} />
    </ComingSoon>
  );
}
