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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Sarlavha */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <User size={18} className="text-primary" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Profilni tahrirlash</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Yopish"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Forma */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
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
        <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-slate-200/50 bg-slate-50">
          <button
            onClick={onClose}
            disabled={update.isPending}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-white transition-all disabled:opacity-50 font-medium"
          >
            Bekor qilish
          </button>
          <button
            onClick={submit}
            disabled={!valid || update.isPending}
            className="px-5 py-2 text-sm rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 min-w-[120px]"
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
