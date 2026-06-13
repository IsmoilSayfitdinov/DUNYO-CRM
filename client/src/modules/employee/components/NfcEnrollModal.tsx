import { useState, type ReactNode } from "react";
import { Nfc, CheckCircle, XCircle, Loader2, Smartphone, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { employeeApi } from "../api/employee-api";

type EnrollState = "idle" | "reading" | "saving" | "success" | "error";

interface NfcEnrollModalProps {
  open: boolean;
  onClose: () => void;
  employeeName: string;
  currentUid?: string | null;
  employeeId: string
}
export function NfcEnrollModal({  open, onClose, employeeName, currentUid, employeeId }: NfcEnrollModalProps) {
  const [state, setState] = useState<EnrollState>("idle");
  const [scannedUid, setScannedUid] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const saveNfc = useMutation({
      mutationFn: (uid: string) => 
        employeeApi.update(employeeId, { nfc_uid: uid })
  })

  const unLinkeNFC = useMutation({
      mutationFn: () => 
        employeeApi.update(employeeId, { nfc_uid: null })
  })

  const startReading = async () => {
    if (!("NDEFReader" in window)) {
      setErrorMsg("Bu brauzer yoki qurilma Web NFC-ni qo'llab-quvvatlamaydi.");
      setState("error");
      return;
    }

    setErrorMsg("");
    setScannedUid(null);
    setState("reading");

    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      toast.info("NFC skanerlash boshlandi. Tegni yaqinlashtiring...");

      ndef.onreading = async (event: any) => {

        const uid = event.serialNumber;
        setScannedUid(uid);
        toast.success(`Karta aniqlandi: ${uid}`);
        setState("saving");

        try {

          await saveNfc.mutateAsync(uid)
          setState("success");

        } catch (backendErr) {
          setErrorMsg("Kartani xodimga biriktirishda xatolik yuz berdi.");
          setState("error");
        }
      };

      ndef.onreadingerror = () => {
        setErrorMsg("NFC tegni o'qib bo'lmadi. Qaytadan urinib ko'ring.");
        setState("error");
      };

    } catch (error) {
      console.error(error);
      toast.error("NFC skanerlashni boshlashda xatolik yuz berdi");
      setErrorMsg("Skaner ruxsatini yoqib bo'lmadi yoki ruxsat berilmadi.");
      setState("error");
    }
  };

  const handleUnlink = async () => {
      try {
        await unLinkeNFC.mutateAsync()
        toast.success("NFC muafaqiyatli o'chirildi !")
      }    catch {
        toast.error("NFC o'chirishda xatolik yuz berdi !")
      }
  };


  const handleClose = () => {
    setState("idle");
    setScannedUid(null);
    setErrorMsg("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2.5 text-lg">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white shrink-0">
              <Nfc size={18} />
            </span>
            NFC karta biriktirish
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{employeeName}</span> uchun karta biriktiring
          </DialogDescription>
        </DialogHeader>

        {/* Mavjud karta holati */}
        {currentUid && state === "idle" && (
          <div className="mx-6 mb-2 flex items-center justify-between gap-3 rounded-2xl border border-success/20 bg-success/5 px-4 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldCheck size={18} className="text-success shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Biriktirilgan karta</p>
                <p className="text-sm font-bold text-slate-800 font-mono truncate">{currentUid}</p>
              </div>
            </div>
            <button
              onClick={handleUnlink}
              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 size={14} /> Uzish
            </button>
          </div>
        )}

        {/* Skan maydoni */}
        <div className="px-6 pb-4">
          <div className="rounded-2xl bg-slate-950 overflow-hidden" style={{ minHeight: 220 }}>
            <div className="relative flex items-center justify-center h-full" style={{ minHeight: 220 }}>
              {/* fon naqsh */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />

              {state === "idle" && (
                <div className="relative z-10 text-center px-6">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/10 flex items-center justify-center text-white/80 ring-1 ring-white/15">
                    <Nfc size={26} />
                  </div>
                  <p className="text-white text-sm font-semibold">
                    {currentUid ? "Yangi karta biriktirish" : "Karta biriktirishga tayyor"}
                  </p>
                  <p className="text-white/45 text-xs mt-1">Tugmani bosib, kartani yaqinlashtiring</p>
                </div>
              )}

              {state === "reading" && (
                <div className="relative z-10 flex flex-col items-center gap-4 p-6 text-center">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
                    <span className="absolute inset-3 rounded-full border-2 border-primary/30 animate-ping [animation-delay:0.3s]" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white shadow-xl shadow-primary/30">
                      <Smartphone size={30} />
                    </div>
                  </div>
                  <p className="text-white text-sm font-bold">Kartani yaqinlashtiring…</p>
                </div>
              )}

              {state === "saving" && (
                <MiniStatus tone="primary" icon={<Loader2 size={34} className="animate-spin" />} title="Saqlanmoqda…" />
              )}

              {state === "success" && (
                <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-success/30">
                    <CheckCircle size={34} />
                  </div>
                  <p className="text-white font-extrabold">Biriktirildi!</p>
                  {scannedUid && <p className="text-white/60 text-xs font-mono">{scannedUid}</p>}
                </div>
              )}

              {state === "error" && (
                <MiniStatus tone="error" icon={<XCircle size={34} />} title={errorMsg || "Xatolik yuz berdi"} />
              )}
            </div>
          </div>
        </div>

        {/* Tugmalar */}
        <div className="px-6 pb-6 flex gap-3">
          {state === "idle" || state === "error" ? (
            <>
              <button
                onClick={handleClose}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98]"
              >
                Yopish
              </button>
              <button
                onClick={startReading}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-red-700 text-white font-bold rounded-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98]"
              >
                <Nfc size={16} /> {currentUid ? "Qayta o'qish" : "Karta o'qish"}
              </button>
            </>
          ) : state === "success" ? (
            <button
              onClick={handleClose}
              className="flex-1 py-3 bg-gradient-to-r from-success to-emerald-600 text-white font-bold rounded-xl hover:opacity-95 transition-all active:scale-[0.98]"
            >
              Tayyor
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              Bekor qilish
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MiniStatus({ tone, icon, title }: { tone: "primary" | "error"; icon: ReactNode; title: string }) {
  const ring = tone === "error" ? "from-destructive to-red-700 shadow-destructive/30" : "from-primary to-red-700 shadow-primary/30";
  return (
    <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center">
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${ring} flex items-center justify-center text-white shadow-xl`}>
        {icon}
      </div>
      <p className="text-white text-sm font-bold max-w-[14rem]">{title}</p>
    </div>
  );
}
