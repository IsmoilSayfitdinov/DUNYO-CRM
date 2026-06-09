import { useState, useEffect } from "react";
import { X, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useChangePassword } from "@/modules/auth";

const inputCls =
  "w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 pr-10 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all bg-white";

export function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const change = useChangePassword();

  useEffect(() => {
    if (open) {
      setCurrent("");
      setNext("");
      setConfirm("");
      setShow(false);
    }
  }, [open]);

  if (!open) return null;

  const tooShort = next.length > 0 && next.length < 8;
  const mismatch = confirm.length > 0 && next !== confirm;
  const valid = current.length > 0 && next.length >= 8 && next === confirm;

  const submit = () => {
    if (!valid) return;
    change.mutate(
      { current_password: current, new_password: next },
      { onSuccess: onClose },
    );
  };

  const field = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    placeholder: string,
  ) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
        <Lock size={12} className="text-slate-400" /> {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={inputCls}
          placeholder={placeholder}
          autoComplete={label.includes("Joriy") ? "current-password" : "new-password"}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          tabIndex={-1}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Lock size={18} className="text-primary" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Parolni o'zgartirish</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {field("Joriy parol", current, setCurrent, "Joriy parolingiz")}
          {field("Yangi parol", next, setNext, "Kamida 8 ta belgi")}
          {tooShort && <p className="text-xs text-red-500 -mt-2">Parol kamida 8 ta belgidan iborat bo'lsin</p>}
          {field("Yangi parolni tasdiqlash", confirm, setConfirm, "Yangi parolni qayta kiriting")}
          {mismatch && <p className="text-xs text-red-500 -mt-2">Parollar mos kelmadi</p>}
          <p className="text-[11px] text-slate-400">
            Parol o'zgargach, boshqa barcha qurilmalardagi seanslar yakunlanadi.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-slate-200/50 bg-slate-50">
          <button onClick={onClose} disabled={change.isPending} className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-white transition-all disabled:opacity-50 font-medium">
            Bekor qilish
          </button>
          <button onClick={submit} disabled={!valid || change.isPending}
            className="px-5 py-2 text-sm rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 min-w-[120px]">
            {change.isPending ? <><Loader2 size={15} className="animate-spin" /> Saqlanmoqda…</> : "O'zgartirish"}
          </button>
        </div>
      </div>
    </div>
  );
}
