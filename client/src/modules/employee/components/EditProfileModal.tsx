import { useState, useEffect } from "react";
import { X, User, AtSign, Phone, Loader2, AlertCircle } from "lucide-react";
import { useUpdateMyProfile } from "@/modules/employee";
import type { Employee, UpdateMyProfileDto } from "@/modules/employee";

const inputCls =
  "w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all bg-white";

export function EditProfileModal({
  open,
  onClose,
  employee,
}: {
  open: boolean;
  onClose: () => void;
  employee: Employee;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  const update = useUpdateMyProfile();

  // Modal har ochilganda joriy qiymatlar bilan to'ldiriladi.
  useEffect(() => {
    if (!open) return;
    setFirstName(employee.user.first_name ?? "");
    setLastName(employee.user.last_name ?? "");
    setUsername(employee.user.username ?? "");
    setPhone(employee.user.phone ?? "");
  }, [open, employee]);

  if (!open) return null;

  // Backend cheklovlariga moslangan validatsiya
  const firstOk = firstName.trim().length >= 1 && firstName.trim().length <= 128;
  const lastOk = lastName.trim().length >= 1 && lastName.trim().length <= 128;
  const usernameOk = username.trim().length >= 3 && username.trim().length <= 50;
  // Telefon ixtiyoriy, lekin kiritilsa — aniq 13 belgi (+998XXXXXXXXX)
  const phoneOk = phone.trim() === "" || phone.trim().length === 13;
  const valid = firstOk && lastOk && usernameOk && phoneOk;

  const submit = () => {
    if (!valid) return;
    // Faqat o'zgargan maydonlarni yuboramiz (PATCH semantikasi).
    const dto: UpdateMyProfileDto = {};
    if (firstName.trim() !== (employee.user.first_name ?? "")) dto.first_name = firstName.trim();
    if (lastName.trim() !== (employee.user.last_name ?? "")) dto.last_name = lastName.trim();
    if (username.trim() !== (employee.user.username ?? "")) dto.username = username.trim();
    const newPhone = phone.trim();
    if (newPhone !== (employee.user.phone ?? "")) dto.phone = newPhone;

    // Hech narsa o'zgarmagan bo'lsa — shunchaki yopamiz.
    if (Object.keys(dto).length === 0) {
      onClose();
      return;
    }
    update.mutate(dto, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[92vh] sm:max-h-none flex flex-col">
        {/* Mobil drag handle — bottom-sheet ko'rinishi */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <span className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>
        {/* Sarlavha */}
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200/50">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Profilni tahrirlash</h3>
            <p className="text-sm text-slate-400 mt-0.5">Shaxsiy ma'lumotlaringizni yangilang</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Yopish"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Forma */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 sm:max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pf-first" className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <User size={12} className="text-slate-400" /> Ism *
              </label>
              <input id="pf-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} placeholder="Ism" />
              {firstName && !firstOk && (
                <p className="text-xs text-destructive flex items-center gap-1.5"><AlertCircle size={12} /> 1–128 ta belgi</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pf-last" className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <User size={12} className="text-slate-400" /> Familiya *
              </label>
              <input id="pf-last" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} placeholder="Familiya" />
              {lastName && !lastOk && (
                <p className="text-xs text-destructive flex items-center gap-1.5"><AlertCircle size={12} /> 1–128 ta belgi</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pf-username" className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <AtSign size={12} className="text-slate-400" /> Foydalanuvchi nomi (username) *
            </label>
            <input id="pf-username" value={username} onChange={(e) => setUsername(e.target.value.trim())} className={inputCls} placeholder="username" autoCapitalize="none" autoCorrect="off" />
            {username && !usernameOk && (
              <p className="text-xs text-destructive flex items-center gap-1.5"><AlertCircle size={12} /> 3–50 ta belgi</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pf-phone" className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Phone size={12} className="text-slate-400" /> Telefon raqam
            </label>
            <input id="pf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className={inputCls} placeholder="+998901234567" />
            {phone && !phoneOk && (
              <p className="text-xs text-destructive flex items-center gap-1.5"><AlertCircle size={12} /> Raqam +998 bilan, aniq 13 ta belgi bo'lsin</p>
            )}
          </div>
        </div>

        {/* Tugmalar */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/80 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <button
            onClick={onClose}
            disabled={update.isPending}
            className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50 font-medium"
          >
            Bekor qilish
          </button>
          <button
            onClick={submit}
            disabled={!valid || update.isPending}
            className="flex-[1.5] sm:flex-none px-5 py-2.5 sm:py-2 text-sm rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 sm:min-w-[130px] shadow-lg shadow-primary/25"
          >
            {update.isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Saqlanmoqda…
              </>
            ) : (
              "Saqlash"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
