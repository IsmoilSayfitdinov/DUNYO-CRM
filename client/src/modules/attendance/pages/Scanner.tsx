import { useState, useEffect, useRef, type ReactNode } from "react";
import { Camera, CheckCircle, XCircle, AlertTriangle, Scan, Clock, Loader2, ArrowRight } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useScan } from "@/modules/attendance";

type ScanState = "idle" | "scanning" | "locating" | "success" | "duplicate" | "error";

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

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

/** Brauzer GPS'ini Promise sifatida oladi */
function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolokatsiya qo'llab-quvvatlanmaydi"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

export function Scanner() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<{ status?: string; check_in?: string | null; check_out?: string | null } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scan = useScan();

  useEffect(() => {
    if (scanState === "scanning") {
      // Skaner uchun konfiguratsiya. videoConstraints: ORQA (back) kamerani tanlaydi.
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        rememberLastUsedCamera: false,
        videoConstraints: { facingMode: { ideal: "environment" } },
      };

      // Skanerni ishga tushirish
      const scanner = new Html5QrcodeScanner("reader", config, /* verbose= */ false);
      scannerRef.current = scanner;

      scanner.render(
        async (decodedText) => {
          // QR aniqlandi — skanerni to'xtatamiz
          if (scannerRef.current) {
            scannerRef.current.clear().catch((err) => console.error("Skanerni tozalashda xatolik", err));
          }

          // 1) QR'dan filial ID'sini ajratamiz
          const branchId = parseBranchId(decodedText);
          if (!branchId) {
            setScanState("error");
            return;
          }

          // 2) GPS olamiz (geo-fence backend tomonda tekshiriladi)
          setScanState("locating");
          let pos: GeolocationPosition;
          try {
            pos = await getPosition();
          } catch {
            toast.error("Joylashuvni aniqlab bo'lmadi. GPS va ruxsatni tekshiring.");
            setScanState("error");
            return;
          }

          // 3) Hammasini serverga yuboramiz
          scan.mutate(
            {
              branch_id: branchId,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            },
            {
              onSuccess: (data) => { setResult(data as any); setScanState("success"); },
              onError: (err: AxiosError) =>
                setScanState(err.response?.status === 409 ? "duplicate" : "error"),
            },
          );
        },
        () => {
          // skanerlash davomidagi xatolarni e'tiborsiz qoldiramiz
        }
      );

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(err => console.error("Skanerni tozalashda xatolik", err));
        }
      };
    }
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

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-5 max-w-sm  sm:max-w-xl md:max-w-2xl mx-auto">
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

      {/* Skaner kartasi */}
      <div className={`rounded-3xl border bg-white overflow-hidden shadow-xl transition-all duration-500 ${
        scanState === "success" ? "border-success/30 shadow-success/10" :
        scanState === "duplicate" ? "border-warning/30 shadow-warning/10" :
        scanState === "error" ? "border-destructive/30 shadow-destructive/10" :
        "border-slate-200 shadow-slate-200/60"
      }`}>
        {/* Kamera / natija maydoni */}
        <div className="relative flex items-center justify-center overflow-hidden bg-slate-950" style={{ minHeight: 320 }}>
          {/* Qorong'i fon naqshi */}
          {(scanState === "idle" || scanState === "scanning") && (
            <div className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "22px 22px" }} />
          )}

          {scanState === "idle" && (
            <>
              <ScanFrame />
              <div className="relative z-10 text-center px-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 ring-1 ring-white/15">
                  <Camera size={30} />
                </div>
                <p className="text-white font-semibold">Skanerlashga tayyor</p>
                <p className="text-white/50 text-xs mt-1">QR kodni ramka ichiga joylashtiring</p>
              </div>
            </>
          )}

          {scanState === "scanning" && (
            <div className="relative w-full">
              <div id="reader" className="w-full overflow-hidden"></div>
              {/* Kamera ustidagi skan ramkasi */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <ScanFrame compact />
              </div>
            </div>
          )}

          {scanState === "locating" && (
            <StatusView
              tone="primary"
              icon={<Loader2 size={40} className="animate-spin" />}
              title="Joylashuv aniqlanmoqda…"
              desc="GPS ruxsatini bering va biroz kuting."
            />
          )}

          {scanState === "success" && (
            <div className="relative z-10 flex flex-col items-center gap-4 p-8 text-center w-full bg-gradient-to-b from-success/10 to-transparent">
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-success/30 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-success/30">
                  <CheckCircle size={42} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">Qayd etildi!</h3>
                <p className="text-white/60 text-sm mt-1">Davomatingiz tizimga yozildi.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-white/15 flex items-center gap-3 text-sm font-bold text-white">
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
              icon={<AlertTriangle size={40} />}
              title="Takroriy skanerlash"
              desc="Siz yaqinda skanerladingiz. Birozdan so'ng qayta urinib ko'ring."
            />
          )}

          {scanState === "error" && (
            <StatusView
              tone="error"
              icon={<XCircle size={40} />}
              title="Skanerlash xatosi"
              desc="QR kod tanilmadi yoki joylashuv mos emas. Rasmiy QR kodni skanerlang."
            />
          )}
        </div>

        {/* Tugmalar */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100">
          {scanState === "idle" ? (
            <button onClick={startScanning}
              className="w-full py-4 bg-gradient-to-r from-primary to-red-700 text-white font-bold rounded-2xl hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98]">
              <Scan size={18} /> Skanerlashni boshlash
            </button>
          ) : scanState === "scanning" || scanState === "locating" ? (
            <button onClick={reset}
              className="w-full py-3.5 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
              Bekor qilish
            </button>
          ) : (
            <button onClick={startScanning}
              className="w-full py-4 bg-gradient-to-r from-primary to-red-700 text-white font-bold rounded-2xl hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98]">
              Qayta skanerlash <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Maslahatlar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500" /> Maslahatlar
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

      <style>{`
        @keyframes scanline {
          0% { top: 4%; opacity: 0.2; }
          50% { top: 92%; opacity: 1; }
          100% { top: 4%; opacity: 0.2; }
        }
        #reader { border: none !important; min-height: 320px; background: #020617 !important; }
        #reader video { border-radius: 0 !important; object-fit: cover !important; }
        #reader img { display: none !important; }
        #reader__dashboard { padding: 8px !important; }
        #reader__dashboard_section_csr button {
          background: linear-gradient(to right, var(--primary), #b91c1c) !important;
          color: #fff !important; border: none !important; border-radius: 0.75rem !important;
          padding: 0.5rem 1rem !important; font-weight: 700 !important; cursor: pointer !important; margin: 0.35rem !important;
        }
        #reader__camera_selection {
          padding: 0.45rem 0.6rem !important; border-radius: 0.6rem !important;
          border: 1px solid rgba(255,255,255,0.15) !important; background: rgba(255,255,255,0.08) !important; color: #fff !important;
        }
        #reader a { color: var(--primary) !important; }
      `}</style>
    </div>
  );
}

/** Qayta ishlatiladigan neon skan ramkasi */
function ScanFrame({ compact = false }: { compact?: boolean }) {
  const size = compact ? "w-52 h-52" : "w-60 h-60";
  return (
    <div className="absolute inset-0 flex items-center justify-center">
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
    <div className="relative z-10 flex flex-col items-center gap-4 p-8 text-center">
      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${ring} flex items-center justify-center text-white shadow-xl`}>
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-extrabold text-white">{title}</h3>
        <p className="text-white/60 text-sm mt-1 max-w-[16rem]">{desc}</p>
      </div>
    </div>
  );
}
