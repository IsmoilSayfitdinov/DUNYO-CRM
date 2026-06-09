import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  /** Ko'rsatiladigan matn: "12", "87.5%", "39.2M", "—". Raqam qismi animatsiya bo'ladi. */
  value: string;
  /** animatsiya davomiyligi (ms) */
  duration?: number;
  className?: string;
}

/**
 * Matn ichidagi raqamni 0 dan haqiqiy qiymatigacha silliq "sanaydi".
 * Prefiks/suffiksni (%, M, UZS...) saqlaydi. Raqam bo'lmasa (masalan "—")
 * matnni o'zgartirmasdan chiqaradi.
 *
 * easeOutCubic — boshda tez, oxirida sekin (tabiiy his).
 */
export function AnimatedNumber({ value, duration = 900, className }: AnimatedNumberProps) {
  // "39.2M" -> prefix="", num=39.2, suffix="M" ; "87.5%" -> suffix="%"
  const match = value.match(/^(\D*)(-?[\d\s,]*\.?\d+)(.*)$/);
  const target = match ? parseFloat(match[2].replace(/[\s,]/g, "")) : NaN;
  const prefix = match?.[1] ?? "";
  const suffix = match?.[3] ?? "";
  const decimals = match?.[2].includes(".") ? (match[2].split(".")[1]?.length ?? 0) : 0;

  const [display, setDisplay] = useState(Number.isFinite(target) ? 0 : value);
  const rafRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!Number.isFinite(target)) {
      setDisplay(value); // raqam emas ("—") — shundayligicha
      return;
    }

    const from = fromRef.current;
    const start = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const current = from + (target - from) * easeOutCubic(t);
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target; // keyingi o'zgarishda shu qiymatdan davom etadi
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, value, duration]);

  if (!Number.isFinite(target)) {
    return <span className={className}>{display as string}</span>;
  }

  const num = typeof display === "number" ? display : target;
  const formatted = num.toLocaleString("uz-UZ", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <span className={className}>{prefix}{formatted}{suffix}</span>;
}

export default AnimatedNumber;
