import { useState, useEffect, useRef } from "react";
import { ScanBarcode } from "lucide-react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useProductByBarcode } from "@/modules/product";
import { ProductSearch, BarcodeScanner, ScannerTips } from "../components/products";

export function Products() {
  // mode: kameraning holati; code: serverda qidirilayotgan barcode
  const [mode, setMode] = useState<"idle" | "scanning">("idle");
  const [code, setCode] = useState<string>("");
  const [manualQuery, setManualQuery] = useState("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Barcode bo'yicha real qidiruv (YesPOS backend proxy orqali)
  const { data: foundProduct, isFetching, isError } = useProductByBarcode(code);

  // BarcodeScanner kutadigan yagona holat
  const scanState =
    mode === "scanning" ? "scanning"
    : code && isFetching ? "searching"
    : code && foundProduct ? "found"
    : code && isError ? "notfound"
    : "idle";

  useEffect(() => {
    if (mode === "scanning") {
      const config = {
        fps: 10,
        qrbox: { width: 280, height: 140 },
        aspectRatio: 1.5,
        rememberLastUsedCamera: false,
        // ORQA (back) kamerani tanlaydi
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

      const scanner = new Html5QrcodeScanner("barcode-reader", config, false);
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          // barcode aniqlandi — qidiruvni ishga tushiramiz (setCode -> query)
          setMode("idle");
          setCode(decodedText.trim());
          if (scannerRef.current) {
            scannerRef.current.clear().catch(() => {});
          }
        },
        () => {}
      );

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {});
        }
      };
    }
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

      {/* Scanner card */}
      <BarcodeScanner
        scanState={scanState}
        foundProduct={foundProduct ?? null}
        scannedCode={code}
        onStart={startScanning}
        onReset={reset}
      />

      {/* Tips */}
      {scanState === "idle" && <ScannerTips />}

      <style>{`
        @keyframes scanline {
          0% { top: 4%; opacity: 0.2; }
          50% { top: 92%; opacity: 1; }
          100% { top: 4%; opacity: 0.2; }
        }
        #barcode-reader { border: none !important; min-height: 300px; background: #020617 !important; }
        #barcode-reader video { border-radius: 0 !important; object-fit: cover !important; }
        #barcode-reader img { display: none !important; }
        #barcode-reader__dashboard { padding: 8px !important; }
        #barcode-reader__dashboard_section_csr button {
          background: linear-gradient(to right, var(--primary), #b91c1c) !important;
          color: #fff !important; border: none !important; border-radius: 0.75rem !important;
          padding: 0.5rem 1rem !important; font-weight: 700 !important; cursor: pointer !important; margin: 0.35rem !important;
        }
        #barcode-reader__camera_selection {
          padding: 0.45rem 0.6rem !important; border-radius: 0.6rem !important;
          border: 1px solid rgba(255,255,255,0.15) !important; background: rgba(255,255,255,0.08) !important; color: #fff !important;
        }
        #barcode-reader a { color: var(--primary) !important; }
      `}</style>
    </div>
  );
}
