import { useState, type ReactNode } from "react";
import { Nfc, CheckCircle, XCircle, AlertTriangle, Clock, Loader2, ArrowRight, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { attendanceApi } from "../api/attendance-api";

type ScanState = "idle" | "scanning" | "sending" | "success" | "duplicate" | "error";

export function NfcScanner() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<{ status?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const nfcMutation = useMutation({
    mutationFn: (uid: string) => attendanceApi.nfc(uid),
  });

  const startScanning = async () => {
    setResult(null);
    setErrorMsg("");

    if (!("NDEFReader" in window)) {
      setErrorMsg("Bu qurilma Web NFC-ni qo'llab-quvvatlamaydi. Android + Chrome kerak.");
      setScanState("error");
      return;
    }

    setScanState("scanning");

    try {
      const reader = new (window as any).NDEFReader();
      await reader.scan();

      reader.onreading = async (event: any) => {
        const uid = event.serialNumber;

        if (!uid) {
          setErrorMsg("Karta UID o'qilmadi. Boshqa karta sinab ko'ring.");
          setScanState("error");
          return;
        }

        setScanState("sending");

        try {
          const data = await nfcMutation.mutateAsync(uid);
          setResult({ status: data.status });
          setScanState("success");
        } catch (err: any) {
          const status = err?.response?.status;
          const detail = err?.response?.data?.detail ?? "";

          if (status === 409) {
            setScanState("duplicate");
          } else if (status === 404) {
            setErrorMsg("Bu karta tizimga biriktirilmagan.");
            setScanState("error");
          } else {
            setErrorMsg(detail || "Server bilan bog'lanishda xatolik.");
            setScanState("error");
          }
        }
      };

      reader.onreadingerror = () => {
        setErrorMsg("Karta o'qilmadi. Qayta yaqinlashtiring.");
        setScanState("error");
      };
    } catch {
      toast.error("NFC ruxsatini yoqib bo'lmadi");
      setErrorMsg("NFC ruxsati berilmadi yoki xatolik yuz berdi.");
      setScanState("error");
    }
  };

  const reset = () => {
    setResult(null);
    setErrorMsg("");
    setScanState("idle");
  };

  const isLeft = result?.status === "left";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Logo / Sarlavha */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white shadow-2xl shadow-primary/40">
          <Nfc size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-white">NFC Kiosk</h1>
        <p className="text-white/40 text-sm mt-1">Kartani yaqinlashtiring</p>
      </div>

      {/* Skaner kartasi */}
      <div className={`w-full max-w-sm rounded-3xl border overflow-hidden shadow-2xl transition-all duration-500 ${
        scanState === "success"   ? "border-success/40 shadow-success/20" :
        scanState === "duplicate" ? "border-amber-500/40 shadow-amber-500/20" :
        scanState === "error"     ? "border-destructive/40 shadow-destructive/20" :
        "border-white/10 shadow-black/40"
      }`}>
        {/* Holat maydoni */}
        <div className="relative flex items-center justify-center overflow-hidden bg-slate-900" style={{ minHeight: 300 }}>
          <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "22px 22px" }} />

          {scanState === "idle" && (
            <div className="relative z-10 text-center px-6">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-white/10 flex items-center justify-center text-white/70 ring-1 ring-white/15">
                <Nfc size={36} />
              </div>
              <p className="text-white font-bold text-lg">Skanerlashga tayyor</p>
              <p className="text-white/40 text-sm mt-1">Tugmani bosing va kartani yaqinlashtiring</p>
            </div>
          )}

          {scanState === "scanning" && (
            <div className="relative z-10 flex flex-col items-center gap-5 p-8 text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
                <span className="absolute inset-4 rounded-full border-2 border-primary/30 animate-ping [animation-delay:0.3s]" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white shadow-2xl shadow-primary/40">
                  <Smartphone size={42} />
                </div>
              </div>
              <p className="text-white font-bold text-lg">Kartani yaqinlashtiring…</p>
              <p className="text-white/40 text-sm">Telefon orqa qismiga tekkizing</p>
            </div>
          )}

          {scanState === "sending" && (
            <StatusView
              tone="primary"
              icon={<Loader2 size={44} className="animate-spin" />}
              title="Tekshirilmoqda…"
              desc="Server bilan bog'lanilmoqda."
            />
          )}

          {scanState === "success" && (
            <div className="relative z-10 flex flex-col items-center gap-4 p-8 text-center w-full">
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-success/30 animate-ping" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center text-white shadow-2xl shadow-success/40">
                  <CheckCircle size={48} />
                </div>
              </div>
              <p className="text-white text-2xl font-extrabold">Qayd etildi!</p>
              <div className="bg-white/10 px-5 py-2.5 rounded-2xl border border-white/15 flex items-center gap-3 text-sm font-bold text-white">
                <Clock size={15} className="text-success" />
                <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <div className="w-px h-4 bg-white/20" />
                <span className={`uppercase tracking-wider text-xs ${isLeft ? "text-amber-300" : "text-emerald-300"}`}>
                  {isLeft ? "Ketdi ✓" : "Keldi ✓"}
                </span>
              </div>
            </div>
          )}

          {scanState === "duplicate" && (
            <StatusView
              tone="warning"
              icon={<AlertTriangle size={44} />}
              title="Takroriy skanerlash"
              desc="Bugun ish kuningiz allaqachon tugagan."
            />
          )}

          {scanState === "error" && (
            <StatusView
              tone="error"
              icon={<XCircle size={44} />}
              title="Xatolik"
              desc={errorMsg || "Karta o'qilmadi. Qayta urinib ko'ring."}
            />
          )}
        </div>

        {/* Tugma */}
        <div className="p-4 bg-slate-900 border-t border-white/5">
          {scanState === "idle" ? (
            <button onClick={startScanning}
              className="w-full py-4 bg-gradient-to-r from-primary to-red-700 text-white font-bold rounded-2xl hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98] text-base">
              <Nfc size={20} /> Skanerlashni boshlash
            </button>
          ) : scanState === "scanning" || scanState === "sending" ? (
            <button onClick={reset}
              className="w-full py-3.5 bg-white/10 text-white/80 font-semibold rounded-2xl hover:bg-white/15 transition-all active:scale-[0.98]">
              Bekor qilish
            </button>
          ) : (
            <button onClick={startScanning}
              className="w-full py-4 bg-gradient-to-r from-primary to-red-700 text-white font-bold rounded-2xl hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98] text-base">
              Qayta skanerlash <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Quyi eslatma */}
      <p className="mt-6 text-white/20 text-xs text-center">
        Faqat Android + Chrome • HTTPS talab qilinadi
      </p>
    </div>
  );
}

function StatusView({ tone, icon, title, desc }: { tone: "primary" | "warning" | "error"; icon: ReactNode; title: string; desc: string }) {
  const ring = tone === "warning" ? "from-amber-500 to-amber-600 shadow-amber-500/30"
    : tone === "error" ? "from-destructive to-red-700 shadow-destructive/30"
    : "from-primary to-red-700 shadow-primary/30";
  return (
    <div className="relative z-10 flex flex-col items-center gap-4 p-8 text-center">
      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${ring} flex items-center justify-center text-white shadow-2xl`}>
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-extrabold text-white">{title}</h3>
        <p className="text-white/50 text-sm mt-1 max-w-[14rem]">{desc}</p>
      </div>
    </div>
  );
}
