import { useState, useEffect, useRef } from "react";
import { ScanBarcode, X, RotateCcw } from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useProductByBarcode } from "@/modules/product";
import { ProductSearch, BarcodeScanner, ScannerTips } from "../components/products";

const READER_ID = "barcode-reader-region";

export function Products() {
  // mode: kameraning holati; code: serverda qidirilayotgan barcode
  const [mode, setMode] = useState<"idle" | "scanning">("idle");
  const [code, setCode] = useState<string>("");
  const [manualQuery, setManualQuery] = useState("");
  const qrRef = useRef<Html5Qrcode | null>(null);

  // Barcode bo'yicha real qidiruv (YesPOS backend proxy orqali)
  const { data: foundProduct, isFetching, isError } = useProductByBarcode(code);

  // BarcodeScanner kutadigan yagona holat
  const scanState =
    mode === "scanning" ? "scanning"
    : code && isFetching ? "searching"
    : code && foundProduct ? "found"
    : code && isError ? "notfound"
    : "idle";

  // Kamerani xavfsiz to'xtatish (state'lar orasida ko'p marta chaqirilishi mumkin).
  const stopCamera = async () => {
    const inst = qrRef.current;
    qrRef.current = null;
    if (!inst) return;
    try {
      if (inst.isScanning) await inst.stop();
      inst.clear();
    } catch {
      /* allaqachon to'xtagan bo'lishi mumkin — e'tiborsiz */
    }
  };

  useEffect(() => {
    if (mode !== "scanning") return;

    let cancelled = false;
    const config = {
      fps: 10,
      // qrbox bermaymiz — kutubxona oq ramka chizmaydi; o'z neon ramkamiz ustida turadi.
      // iPhone bug fix: facingMode'ni videoConstraints ichida { ideal } bilan beramiz.
      // Bare "environment" iOS Safari'da qattiq talab bo'lib, getUserMedia'ni rad ettiradi.
      videoConstraints: { facingMode: { ideal: "environment" } },
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.QR_CODE,
      ],
    };

    const html5Qr = new Html5Qrcode(READER_ID, /* verbose= */ false);
    qrRef.current = html5Qr;

    html5Qr
      .start(
        // 1-argument majburiy, lekin config'dagi videoConstraints ustun keladi.
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          if (cancelled) return;
          // barcode aniqlandi — kamerani to'xtatib, qidiruvni ishga tushiramiz.
          await stopCamera();
          setMode("idle");
          setCode(decodedText.trim());
        },
        () => {
          // har kadrdagi "topilmadi" xatolarini e'tiborsiz qoldiramiz
        },
      )
      .catch(() => {
        // kamera ochilmadi — idle holatga qaytamiz
        if (!cancelled) setMode("idle");
      });

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [mode]);

  const startScanning = () => {
    setCode("");
    setMode("scanning");
  };

  const reset = () => {
    setMode("idle");
    setCode("");
  };

  const handleManualSearch = () => {
    if (!manualQuery.trim()) return;
    setMode("idle");
    setCode(manualQuery.trim());
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-sm sm:max-w-xl md:max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white shadow-lg shadow-primary/25 shrink-0">
          <ScanBarcode size={20} />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">Mahsulot topish</h1>
          <p className="text-xs sm:text-sm text-slate-400">Barkodni skanerlang yoki qo'lda qidiring</p>
        </div>
      </div>

      {/* Manual search */}
      {scanState === "idle" && (
        <ProductSearch
          manualQuery={manualQuery}
          onChange={setManualQuery}
          onSearch={handleManualSearch}
        />
      )}

      {/* Scanner card (scanning'dan boshqa barcha holatlar — oq karta) */}
      <BarcodeScanner
        scanState={scanState}
        foundProduct={foundProduct ?? null}
        scannedCode={code}
        onStart={startScanning}
        onReset={reset}
      />

      {/* Tips */}
      {scanState === "idle" && <ScannerTips />}

      {/* ===== FULL-SCREEN KAMERA OVERLAY (faqat skanerlash paytida) ===== */}
      {mode === "scanning" && (
        <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col">
          {/* Kamera video shu yerga chiziladi */}
          <div id={READER_ID} className="absolute inset-0 w-full h-full" />

          {/* Yuqori panel */}
          <div className="relative z-20 flex items-center justify-between px-5"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.25rem)" }}>
            <div className="flex items-center gap-2 text-white/90 font-semibold text-sm bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-full ring-1 ring-white/15">
              <ScanBarcode size={15} /> Barkod skaneri
            </div>
            <button onClick={reset}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/15 flex items-center justify-center text-white hover:bg-white/20 transition active:scale-95">
              <X size={20} />
            </button>
          </div>

          {/* Markaz: keng (barcode) neon ramka */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
            <div className="relative w-72 h-40 max-w-[82%]">
              {[
                "top-0 left-0 border-t-4 border-l-4 rounded-tl-xl",
                "top-0 right-0 border-t-4 border-r-4 rounded-tr-xl",
                "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl",
                "bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl",
              ].map((c) => (
                <div key={c} className={`absolute w-9 h-9 border-primary ${c}`} style={{ filter: "drop-shadow(0 0 6px var(--primary))" }} />
              ))}
              <div className="absolute left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_16px_2px_var(--primary)] animate-[scanline_2.4s_ease-in-out_infinite]" />
            </div>
            <p className="mt-8 text-white/80 text-sm font-medium px-8 text-center">
              Shtrix-kodni ramka ichiga joylashtiring
            </p>
          </div>

          {/* Pastki tugma */}
          <div className="relative z-20 px-5"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)" }}>
            <button onClick={reset}
              className="w-full py-3.5 bg-white/10 backdrop-blur-md ring-1 ring-white/15 text-white font-semibold rounded-2xl hover:bg-white/20 transition active:scale-[0.98] flex items-center justify-center gap-2">
              <X size={16} /> Bekor qilish
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scanline {
          0% { top: 4%; opacity: 0.2; }
          50% { top: 92%; opacity: 1; }
          100% { top: 4%; opacity: 0.2; }
        }
        /* === html5-qrcode'ni TO'LIQ EKRANGA majburlash === */
        #${READER_ID} img, #${READER_ID} button, #${READER_ID} select, #${READER_ID} a { display: none !important; }
        #${READER_ID} {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          padding: 0 !important;
        }
        #${READER_ID} #qr-shaded-region { display: none !important; }
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
