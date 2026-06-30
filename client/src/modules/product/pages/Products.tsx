import { useState } from "react";
import { ScanBarcode, X } from "lucide-react";
import { Scanner as BarcodeReader, type IDetectedBarcode, type IScannerError } from "@yudiel/react-qr-scanner";
import { useProductByBarcode } from "@/modules/product";
import { ProductSearch, BarcodeScanner, ScannerTips } from "../components/products";

export function Products() {
  // mode: kameraning holati; code: serverda qidirilayotgan barcode
  const [mode, setMode] = useState<"idle" | "scanning">("idle");
  const [code, setCode] = useState<string>("");
  const [manualQuery, setManualQuery] = useState("");

  // Barcode bo'yicha real qidiruv (YesPOS backend proxy orqali)
  const { data: foundProduct, isFetching, isError } = useProductByBarcode(code);

  // BarcodeScanner kutadigan yagona holat
  const scanState =
    mode === "scanning" ? "scanning"
    : code && isFetching ? "searching"
    : code && foundProduct ? "found"
    : code && isError ? "notfound"
    : "idle";

  // Barcode aniqlanganda chaqiriladi (yudiel/react-qr-scanner).
  // Faqat "scanning" paytida ishlov beramiz — keyingi (kechikkan) skanlarni e'tiborsiz qoldiramiz.
  const handleScan = (codes: IDetectedBarcode[]) => {
    if (mode !== "scanning") return;
    const text = codes[0]?.rawValue;
    if (!text) return;
    // mode "idle"ga o'tadi → kamera bloki unmount bo'ladi va o'zi yopiladi.
    setMode("idle");
    setCode(text.trim());
  };

  // Kamera xatosi (ruxsat yo'q / qurilma yo'q / xavfsiz kontekst emas).
  const handleScanError = (err: IScannerError) => {
    setMode("idle");
    // eslint-disable-next-line no-console
    console.warn("[barcode] kamera xatosi:", err.kind, err.message);
  };

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
          {/* Kamera — barcha barcode formatlarini o'qiydi. Aniqlangach mode "idle"ga
              o'tadi → bu blok unmount bo'ladi → kamera o'zi yopiladi. */}
          <div className="absolute inset-0 [&_video]:w-full [&_video]:h-full [&_video]:object-cover">
            <BarcodeReader
              onScan={handleScan}
              onError={handleScanError}
              formats={["qr_code", "ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"]}
              constraints={{ facingMode: "environment" }}
              components={{ finder: false }}
              allowMultiple={false}
              scanDelay={500}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { width: "100%", height: "100%", objectFit: "cover" },
              }}
            />
          </div>

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
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none">
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
      `}</style>
    </div>
  );
}
