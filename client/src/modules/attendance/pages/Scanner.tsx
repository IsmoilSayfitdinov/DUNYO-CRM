import { useState, useEffect, useRef, type ReactNode } from "react";
import { Camera, CheckCircle, XCircle, AlertTriangle, Scan, Clock, Loader2, RotateCcw, MapPin, X, Lightbulb } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import type { AxiosError } from "axios";
import { useScan } from "@/modules/attendance";
import { useGeolocation, type GeoCoords } from "@/shared/lib/useGeolocation";
import { GeoPermissionSheet } from "@/shared/ui/GeoPermissionSheet";

type ScanState = "idle" | "scanning" | "locating" | "success" | "duplicate" | "error";

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const READER_ID = "qr-reader-region";

/** QR matnidan filial UUID'sini ajratadi: JSON {branch_id} yoki bare UUID yoki URL ichidagi UUID */
function parseBranchId(text: string): string | null {
  if (!text) return null;
  try {
    const obj = JSON.parse(text);
    if (obj && typeof obj.branch_id === "string") {
      const m = obj.branch_id.match(UUID_RE);
      return m ? m[0] : null;
    }
  } catch {
    /* JSON emas — pastda UUID qidiramiz */
  }
  const m = text.match(UUID_RE);
  return m ? m[0] : null;
}

export function Scanner() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<{ status?: string; check_in?: string | null; check_out?: string | null } | null>(null);
  const qrRef = useRef<Html5Qrcode | null>(null);
  const scan = useScan();

  // Geolokatsiya logikasi shu hook ichida (xato kodlari, holat, qayta urinish).
  const geo = useGeolocation();
  // Joylashuv ruxsati paneli ochiqmi?
  const [geoSheetOpen, setGeoSheetOpen] = useState(false);
  // Joylashuv olingach davom ettirish uchun, skanerlangan branch_id'ni saqlaymiz.
  const pendingBranchId = useRef<string | null>(null);

  // Olingan joylashuv bilan serverga skan yuborish (success/duplicate/error holatlarini boshqaradi).
  const submitScan = (branchId: string, pos: GeoCoords) => {
    scan.mutate(
      { branch_id: branchId, latitude: pos.latitude, longitude: pos.longitude },
      {
        onSuccess: (data) => { setResult(data as any); setScanState("success"); },
        onError: (err: AxiosError) =>
          setScanState(err.response?.status === 409 ? "duplicate" : "error"),
      },
    );
  };

  // Joylashuvni so'raydi; muvaffaqiyatda skan yuboradi, xatoda ruxsat panelini ochadi.
  const requestLocation = async (branchId: string) => {
    pendingBranchId.current = branchId;
    setScanState("locating");
    try {
      const pos = await geo.request();
      setGeoSheetOpen(false);
      submitScan(branchId, pos);
    } catch {
      // Xato ma'lumoti geo.error ichida — panelni ochib ko'rsatamiz.
      setGeoSheetOpen(true);
    }
  };

  // Panel ichidagi "Ruxsat berish" / "Qayta urinish" tugmasi.
  const retryLocation = () => {
    if (pendingBranchId.current) requestLocation(pendingBranchId.current);
  };

  // Kamerani xavfsiz to'xtatish (state'lar orasida ko'p marta chaqirilishi mumkin).
  const stopCamera = async () => {
    const inst = qrRef.current;
    qrRef.current = null;
    if (!inst) return;
    try {
      // isScanning bo'lsa avval stop(), keyin clear() — aks holda kutubxona warning beradi.
      if (inst.isScanning) await inst.stop();
      inst.clear();
    } catch {
      /* allaqachon to'xtagan bo'lishi mumkin — e'tiborsiz */
    }
  };

  // scanState "scanning" bo'lganda kamerani ishga tushiramiz, aks holda to'xtatamiz.
  useEffect(() => {
    if (scanState !== "scanning") return;

    let cancelled = false;
    // MUHIM (iPhone bug fix): facingMode'ni videoConstraints ICHIDA { ideal } bilan beramiz.
    // Bare "environment" iOS Safari'da QATTIQ talab sifatida tushuniladi va orqa kamerani
    // darrov aniqlay olmasa (ruxsat yangi so'ralganda) getUserMedia rad etadi → iPhone ishlamaydi.
    // { ideal } esa YUMSHOQ — orqa kamera bo'lmasa istalganini oladi, hech qachon rad etmaydi.
    //
    // MUHIM (iPhone QR DEKOD bug fix): qrbox + aspectRatio + ideal width/height qo'shamiz.
    // Sabab: qrbox berilmasa, html5-qrcode skan hududini VIDEO ELEMENTNING o'lchamidan
    // hisoblaydi. Biz video'ni CSS bilan full-screen cho'zganimiz uchun (object-fit:cover),
    // iOS Safari'da ko'rinadigan o'lcham (ekran) haqiqiy kamera kadri (1280×720) bilan
    // mos kelmaydi → kutubxona noto'g'ri/teskari (landscape↔portrait) hudud oladi →
    // bo'sh kadrni dekod qiladi → QR HECH QACHON topilmaydi, lekin xato ham bermaydi
    // (Android'da bu muammo yo'q). qrbox'ni ANIQ piksel bilan berib, bu bog'liqlikni uzamiz.
    // qrbox'ning oq ramkasi pastdagi CSS (#qr-shaded-region display:none) bilan yashiringan,
    // shuning uchun bizning neon ScanFrame dizaynimiz buzilmaydi.
    const computeQrbox = (vw: number, vh: number) => {
      const minEdge = Math.min(vw, vh);
      const size = Math.floor(minEdge * 0.7); // ko'rinadigan kadrning 70% — markaziy skan hududi
      return { width: size, height: size };
    };
    const config = {
      fps: 10,
      qrbox: computeQrbox,
      aspectRatio: 1.0, // kvadrat — iOS landscape/portrait chalkashligini oldini oladi
      videoConstraints: {
        facingMode: { ideal: "environment" },
        // iOS'ga aniq rezolyutsiya beramiz — kamera kadri prognoz qilinadigan bo'ladi.
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    const html5Qr = new Html5Qrcode(READER_ID, /* verbose= */ false);
    qrRef.current = html5Qr;

    html5Qr
      .start(
        // 1-argument majburiy (kutubxona bo'sh bo'lsa xato beradi), lekin config'dagi
        // videoConstraints ustun keladi — shuning uchun bu faqat formal qiymat.
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          if (cancelled) return;
          // QR aniqlandi — kamerani to'xtatamiz va davom etamiz.
          await stopCamera();

          const branchId = parseBranchId(decodedText);
          if (!branchId) {
            setScanState("error");
            return;
          }
          requestLocation(branchId);
        },
        () => {
          // har kadrdagi "topilmadi" xatolarini e'tiborsiz qoldiramiz
        },
      )
      .catch(() => {
        // kamera ochilmadi (ruxsat yo'q / qurilma yo'q) — xato holatiga o'tamiz
        if (!cancelled) setScanState("error");
      });

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [scanState]);

  const startScanning = () => {
    setResult(null);
    setScanState("scanning");
  };

  const reset = () => {
    setResult(null);
    setScanState("idle");
  };

  const isLeft = result?.status === "left";
  // Kamera full-screen rejimda — idle'dan boshqa barcha "faol" holatlar ekranni egallaydi.
  const isFullscreen = scanState !== "idle";

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-5 max-w-sm sm:max-w-xl md:max-w-2xl mx-auto">
      {/* Sarlavha */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white shadow-lg shadow-primary/25 shrink-0">
          <Scan size={20} />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">Kelish-ketish skaneri</h1>
          <p className="text-xs sm:text-sm text-slate-400">Kompaniya QR kodini skanerlang</p>
        </div>
      </div>

      {/* Idle holatdagi karta (ekran ichida) */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/60">
        <div className="relative flex items-center justify-center overflow-hidden bg-slate-950" style={{ minHeight: 340 }}>
          {/* Nuqtali fon naqshi */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "22px 22px" }} />
          {/* Yumshoq rangli halo */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />

          <ScanFrame idle />
          <div className="relative z-10 text-center px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 ring-1 ring-white/15">
              <Camera size={30} />
            </div>
            <p className="text-white font-semibold">Skanerlashga tayyor</p>
            <p className="text-white/50 text-xs mt-1">Tugmani bosing — kamera to'liq ekranda ochiladi</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border-t border-slate-100">
          <button onClick={startScanning}
            className="w-full py-4 bg-gradient-to-r from-primary to-red-700 text-white font-bold rounded-2xl hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98]">
            <Scan size={18} /> Skanerlashni boshlash
          </button>
        </div>
      </div>

      {/* Maslahatlar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Lightbulb size={15} className="text-amber-500" /> Maslahatlar
        </h4>
        <ul className="space-y-2.5">
          {[
            "Zarur bo'lsa, ekran yorqinligini oshiring",
            "Telefonni barqaror ushlang",
            "O'qilmaydigan QR kod haqida menejerga xabar bering",
            "Yozuvlarni 'Davomat tarixi' bo'limida ko'rishingiz mumkin",
          ].map((tip, i) => (
            <li key={i} className="text-xs sm:text-sm text-slate-600 flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* ===== FULL-SCREEN OVERLAY ===== */}
      {/* Kamera va barcha holatlar shu qora overlay ichida ekranni to'liq egallaydi.
          z-[60]: layout'dagi MobileBottomNav/Drawer (z-50) ustida turishi uchun.
          GeoPermissionSheet undan ham yuqorida (z-[70]) bo'lishi kerak — pastda override qilinadi. */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col">
          {/* Kamera video shu yerga chiziladi (har doim mavjud bo'lishi kerak, shuning uchun yashirmaymiz) */}
          <div
            id={READER_ID}
            className={`absolute inset-0 w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover ${
              scanState === "scanning" ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Yuqori panel: yopish tugmasi */}
          <div className="relative z-20 flex items-center justify-between px-5 pt-5"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.25rem)" }}>
            <div className="flex items-center gap-2 text-white/90 font-semibold text-sm bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-full ring-1 ring-white/15">
              <Scan size={15} /> Skaner
            </div>
            <button onClick={reset}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/15 flex items-center justify-center text-white hover:bg-white/20 transition active:scale-95">
              <X size={20} />
            </button>
          </div>

          {/* Markaz: skan ramkasi (faqat skanerlash paytida) */}
          {scanState === "scanning" && (
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
              <ScanFrame />
              <p className="mt-8 text-white/80 text-sm font-medium px-8 text-center">
                QR kodni ramka ichiga joylashtiring
              </p>
            </div>
          )}

          {/* Holat ekranlari — absolute markazda (yuqori/pastki panellardan qat'i nazar
              har doim ekran o'rtasida turadi). inset-0 + flex-center = mukammal markaz. */}
          {scanState !== "scanning" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
              {scanState === "locating" && !geoSheetOpen && (
                <StatusView
                  tone="primary"
                  icon={<Loader2 size={44} className="animate-spin" />}
                  title="Joylashuv aniqlanmoqda…"
                  desc="GPS ruxsatini bering va biroz kuting."
                />
              )}

              {scanState === "locating" && geoSheetOpen && (
                <StatusView
                  tone="error"
                  icon={<MapPin size={44} />}
                  title="Joylashuv kerak"
                  desc="Pastdagi oynadan ruxsat bering yoki qayta urinib ko'ring."
                />
              )}

              {scanState === "success" && (
                <div className="flex flex-col items-center gap-5 text-center animate-[pop_0.4s_ease-out]">
                  <div className="relative">
                    <span className="absolute inset-0 rounded-full bg-success/30 animate-ping" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-success/30">
                      <CheckCircle size={50} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-white">Qayd etildi!</h3>
                    <p className="text-white/60 text-sm mt-1">Davomatingiz tizimga yozildi.</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl ring-1 ring-white/15 flex items-center gap-3 text-sm font-bold text-white">
                    <Clock size={15} className="text-success" />
                    <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <div className="w-px h-4 bg-white/20" />
                    <span className={`uppercase tracking-wider text-xs ${isLeft ? "text-amber-300" : "text-emerald-300"}`}>
                      {isLeft ? "Ketdi" : "Keldi"}
                    </span>
                  </div>
                </div>
              )}

              {scanState === "duplicate" && (
                <StatusView
                  tone="warning"
                  icon={<AlertTriangle size={44} />}
                  title="Takroriy skanerlash"
                  desc="Siz yaqinda skanerladingiz. Birozdan so'ng qayta urinib ko'ring."
                />
              )}

              {scanState === "error" && (
                <StatusView
                  tone="error"
                  icon={<XCircle size={44} />}
                  title="Skanerlash xatosi"
                  desc="QR kod tanilmadi yoki joylashuv mos emas. Rasmiy QR kodni skanerlang."
                />
              )}
            </div>
          )}

          {/* Pastki tugma paneli */}
          <div className="relative z-20 px-5 pb-5"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)" }}>
            {scanState === "scanning" || scanState === "locating" ? (
              <button onClick={reset}
                className="w-full py-3.5 bg-white/10 backdrop-blur-md ring-1 ring-white/15 text-white font-semibold rounded-2xl hover:bg-white/20 transition active:scale-[0.98]">
                Bekor qilish
              </button>
            ) : (
              <button onClick={startScanning}
                className="w-full py-4 bg-gradient-to-r from-primary to-red-700 text-white font-bold rounded-2xl hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98]">
                <RotateCcw size={18} /> Qayta skanerlash
              </button>
            )}
          </div>
        </div>
      )}

      {/* Joylashuv ruxsati paneli — pastdan chiqadi */}
      <GeoPermissionSheet
        open={geoSheetOpen}
        onOpenChange={(o) => {
          setGeoSheetOpen(o);
          // Foydalanuvchi panelni yopsa va joylashuv olinmagan bo'lsa — xato holatiga o'tamiz.
          if (!o && scanState === "locating") setScanState("error");
        }}
        locating={geo.status === "locating"}
        error={geo.error}
        onRequest={retryLocation}
      />

      <style>{`
        @keyframes scanline {
          0% { top: 4%; opacity: 0.2; }
          50% { top: 92%; opacity: 1; }
          100% { top: 4%; opacity: 0.2; }
        }
        @keyframes pop {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        /* === html5-qrcode'ni TO'LIQ EKRANGA majburlash === */
        /* Kutubxona standart UI'sini (tugma, rasm, oq qrbox ramka) yashiramiz — o'z dizaynimiz ishlatiladi */
        #${READER_ID} img, #${READER_ID} button, #${READER_ID} select, #${READER_ID} a { display: none !important; }
        /* MUHIM: kutubxona root div'ga inline height (masalan 384px) o'rnatadi.
           Uni absolute + inset-0 bilan butun overlay'ga majburan cho'zamiz. */
        #${READER_ID} {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          padding: 0 !important;
        }
        /* qrbox sun'iy ramkasini (oq chiziqlar) butunlay o'chiramiz */
        #${READER_ID} #qr-shaded-region { display: none !important; }
        /* Video — butun ekranni qoplaydi (cover), kesilsa kesilsin, lekin bo'sh joy qolmasin */
        #${READER_ID} video {
          border-radius: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          position: absolute !important;
          inset: 0 !important;
        }
      `}</style>
    </div>
  );
}

/** Qayta ishlatiladigan neon skan ramkasi. idle=karta ichida kichik, aks holda full-screen kattaroq. */
function ScanFrame({ idle = false }: { idle?: boolean }) {
  const size = idle ? "w-56 h-56" : "w-64 h-64 sm:w-72 sm:h-72";
  return (
    <div className={`${idle ? "absolute inset-0 flex items-center justify-center" : ""}`}>
      <div className={`relative ${size}`}>
        {[
          "top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl",
          "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl",
          "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl",
          "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl",
        ].map((c) => (
          <div key={c} className={`absolute w-10 h-10 border-primary ${c}`} style={{ filter: "drop-shadow(0 0 6px var(--primary))" }} />
        ))}
        {/* Animatsiyali skan chizig'i */}
        <div className="absolute left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_16px_2px_var(--primary)] animate-[scanline_2.4s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}

/** Qayta ishlatiladigan holat ko'rinishi (qorong'i fon ustida) */
function StatusView({ tone, icon, title, desc }: { tone: "primary" | "warning" | "error"; icon: ReactNode; title: string; desc: string }) {
  const ring = tone === "warning" ? "from-warning to-amber-600 shadow-warning/30"
    : tone === "error" ? "from-destructive to-red-700 shadow-destructive/30"
    : "from-primary to-red-700 shadow-primary/30";
  return (
    <div className="flex flex-col items-center gap-5 text-center animate-[pop_0.4s_ease-out]">
      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${ring} flex items-center justify-center text-white shadow-xl`}>
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-extrabold text-white">{title}</h3>
        <p className="text-white/60 text-sm mt-1 max-w-[18rem]">{desc}</p>
      </div>
    </div>
  );
}
