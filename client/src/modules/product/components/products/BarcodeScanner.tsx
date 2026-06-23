import {
  ScanBarcode, XCircle, ArrowRight, X, Loader2,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Product } from "@/modules/product";
import { ProductDetail } from "./ProductDetail";

type ScanState = "idle" | "scanning" | "searching" | "found" | "notfound";

interface Props {
  scanState: ScanState;
  foundProduct: Product | null;
  scannedCode: string;
  onStart: () => void;
  onReset: () => void;
}

/** Keng (barcode uchun) neon skan ramkasi */
function WideFrame() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-64 h-32 max-w-[80%]">
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
    </div>
  );
}

function StatusView({ tone, icon, title, desc }: { tone: "primary" | "error"; icon: ReactNode; title: string; desc: string }) {
  const ring = tone === "error" ? "from-destructive to-red-700 shadow-destructive/30" : "from-primary to-red-700 shadow-primary/30";
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

export function BarcodeScanner({ scanState, foundProduct, scannedCode, onStart, onReset }: Props) {
  const isFound = scanState === "found";
  const themedBorder =
    isFound ? "border-success/30 shadow-success/10" :
    scanState === "notfound" ? "border-destructive/30 shadow-destructive/10" :
    "border-slate-200 shadow-slate-200/60";

  return (
    <div className={`rounded-3xl border bg-white overflow-hidden shadow-xl transition-all duration-500 ${themedBorder}`}>
      {/* Viewport — topilganda oq (ProductDetail), aks holda qorong'i kamera */}
      <div
        className={`relative flex items-center justify-center overflow-hidden ${isFound ? "bg-white" : "bg-slate-950"}`}
        style={{ minHeight: isFound ? undefined : 300 }}
      >
        {(scanState === "idle" || scanState === "scanning") && (
          <div className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "22px 22px" }} />
        )}

        {scanState === "idle" && (
          <>
            <WideFrame />
            <div className="relative z-10 text-center px-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 ring-1 ring-white/15">
                <ScanBarcode size={30} />
              </div>
              <p className="text-white font-semibold">Barkodni o'qishga tayyor</p>
              <p className="text-white/50 text-xs mt-1">Shtrix-kodni ramka ichiga joylashtiring</p>
            </div>
          </>
        )}

        {/* scanning holati endi full-screen overlay'da (Products.tsx) — bu yerda
            faqat "kamera ochilmoqda" ko'rinishi qoladi (overlay ko'tarilгунча qisqa lahza) */}
        {scanState === "scanning" && (
          <>
            <WideFrame />
            <div className="relative z-10 text-center px-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 ring-1 ring-white/15">
                <Loader2 size={30} className="animate-spin" />
              </div>
              <p className="text-white font-semibold">Kamera ochilmoqda…</p>
            </div>
          </>
        )}

        {scanState === "searching" && (
          <StatusView tone="primary" icon={<Loader2 size={40} className="animate-spin" />} title="Mahsulot qidirilmoqda…" desc="Bazadan ma'lumot olinmoqda." />
        )}

        {scanState === "found" && foundProduct && (
          <ProductDetail product={foundProduct} />
        )}

        {scanState === "notfound" && (
          <StatusView
            tone="error"
            icon={<XCircle size={40} />}
            title="Mahsulot topilmadi"
            desc={scannedCode ? `Bu kodga mos mahsulot yo'q: ${scannedCode}` : "Bu kodga mos mahsulot bazada yo'q."}
          />
        )}
      </div>

      {/* Tugmalar */}
      <div className="p-4 sm:p-5 bg-white border-t border-slate-100">
        {scanState === "idle" ? (
          <button onClick={onStart}
            className="w-full py-4 bg-gradient-to-r from-primary to-red-700 text-white font-bold rounded-2xl hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98]">
            <ScanBarcode size={18} /> Barkodni skanerlash
          </button>
        ) : scanState === "scanning" ? (
          <button onClick={onReset}
            className="w-full py-3.5 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
            <X size={16} /> Bekor qilish
          </button>
        ) : (
          <button onClick={onStart}
            className="w-full py-4 bg-gradient-to-r from-primary to-red-700 text-white font-bold rounded-2xl hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98]">
            Yana skanerlash <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
