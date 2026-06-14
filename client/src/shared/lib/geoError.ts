// GeolocationPositionError.code → foydalanuvchiga ko'rsatiladigan matn.
// Bu LOGIKA emas — shunchaki xato kodini tushunarli matnga aylantiruvchi lug'at.
// Telefon turi (iOS / Android) ni aniqlab, mos Settings ko'rsatmasini beradi.

export type GeoErrorKind = "denied" | "unavailable" | "timeout" | "unsupported";

export interface GeoErrorInfo {
  kind: GeoErrorKind;
  /** Sheet sarlavhasi */
  title: string;
  /** Qisqa tushuntirish */
  message: string;
  /** Settings'ga borish bo'yicha qadamlar (denied bo'lganda ko'rsatiladi) */
  steps?: string[];
}

/** Foydalanuvchi qaysi platformada — ko'rsatmalarni moslash uchun */
function detectPlatform(): "ios" | "android" | "other" {
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  // iPadOS 13+ o'zini Mac deb ko'rsatadi — touch bilan tekshiramiz
  if (/Macintosh/.test(ua) && "ontouchend" in document) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

const IOS_STEPS = [
  "Sozlamalar (Settings) ni oching",
  "Maxfiylik va xavfsizlik → Joylashuv xizmatlari (Location Services) — yoqilgan bo'lsin",
  "Ro'yxatdan brauzeringizni (Safari / Chrome) toping → «Ilovadan foydalanganda» (While Using) ni tanlang",
  "Saytni yopib, qaytadan oching",
];

const ANDROID_STEPS = [
  "Telefon sozlamalarida Joylashuv (Location) yoqilganini tekshiring",
  "Brauzer manzil satridagi 🔒 belgisini bosing → Ruxsatlar (Permissions)",
  "Joylashuv (Location) ni «Ruxsat» (Allow) ga o'tkazing",
  "Sahifani yangilang (refresh)",
];

const OTHER_STEPS = [
  "Brauzer manzil satridagi 🔒 belgisini bosing",
  "Joylashuv (Location) ruxsatini «Allow» ga o'zgartiring",
  "Sahifani yangilang",
];

/**
 * getCurrentPosition error callback'idagi xatoni tushunarli ma'lumotga aylantiradi.
 * @param err GeolocationPositionError yoki oddiy Error (qo'llab-quvvatlanmagan holat)
 */
export function geoErrorInfo(err: unknown): GeoErrorInfo {
  const platform = detectPlatform();
  const steps =
    platform === "ios" ? IOS_STEPS : platform === "android" ? ANDROID_STEPS : OTHER_STEPS;

  // GeolocationPositionError bo'lsa, code maydoni bor: 1=DENIED, 2=UNAVAILABLE, 3=TIMEOUT
  const code = typeof err === "object" && err !== null && "code" in err
    ? (err as GeolocationPositionError).code
    : undefined;

  switch (code) {
    case 1: // PERMISSION_DENIED
      return {
        kind: "denied",
        title: "Joylashuvga ruxsat berilmagan",
        message:
          "Davom etish uchun joylashuv ruxsati kerak. Quyidagi qadamlar bo'yicha sozlamalardan yoqing:",
        steps,
      };
    case 2: // POSITION_UNAVAILABLE
      return {
        kind: "unavailable",
        title: "Joylashuv aniqlanmadi",
        message:
          "GPS signali topilmadi. Ochiq joyga chiqing yoki telefon GPS'ini yoqib, qayta urinib ko'ring.",
      };
    case 3: // TIMEOUT
      return {
        kind: "timeout",
        title: "Vaqt tugadi",
        message: "Joylashuvni aniqlash juda uzoq davom etdi. Qayta urinib ko'ring.",
      };
    default:
      return {
        kind: "unsupported",
        title: "Joylashuv mavjud emas",
        message: "Brauzeringiz joylashuvni qo'llab-quvvatlamaydi yoki noma'lum xatolik yuz berdi.",
      };
  }
}
