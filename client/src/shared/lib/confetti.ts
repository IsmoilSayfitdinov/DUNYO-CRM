import confetti from "canvas-confetti";

/**
 * Bayram konfetti — muvaffaqiyatli check-in, vazifa bajarish kabi
 * ijobiy hodisalarda chaqiriladi. Brend ranglarida (qizil + oltin).
 *
 * `prefers-reduced-motion` yoqilgan foydalanuvchilarda animatsiya
 * o'tkazib yuboriladi (qulaylik / harakatga sezgirlik).
 */
export function celebrate() {
  if (typeof window === "undefined") return;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduced) return;

  const colors = ["#dc2626", "#ef4444", "#f59e0b", "#fbbf24", "#ffffff"];

  // Markazdan ikki tomonga otiladi
  confetti({
    particleCount: 70,
    spread: 70,
    origin: { y: 0.6 },
    colors,
    scalar: 0.9,
    disableForReducedMotion: true,
  });
  // Chap va o'ng burchaklardan qo'shimcha portlash (boyroq effekt)
  setTimeout(() => {
    confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors, disableForReducedMotion: true });
    confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors, disableForReducedMotion: true });
  }, 120);
}

export default celebrate;
