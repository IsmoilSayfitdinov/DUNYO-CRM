import React, { useEffect } from "react";
import { X, User, Phone, Clock, Shield, Lock, Briefcase, Hash, Coins, Building2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Employee } from "../types";
import type { EmployeeFormValues } from "../types/form";
import { TimePicker } from "@/shared/ui/TimePicker";
import CustomSelect from "@/shared/ui/CustomSelect";
import { useBranches } from "@/modules/branch";

const employeeSchema = z.object({
  first_name: z.string().min(1, "Ism kiriting"),
  last_name: z.string().min(1, "Familiya kiriting"),
  username: z.string().min(3, "Foydalanuvchi nomi kamida 3 ta belgi").max(50, "Foydalanuvchi nomi 50 belgidan oshmasin"),
  // Backend min 8 talab qiladi
  password: z.string().min(8, "Parol kamida 8 ta belgi").or(z.literal("")),
  phone: z.string().refine((v) => /^\+998\d{9}$/.test(v), "To'liq raqam kiriting: +998 va 9 ta raqam"),
  position: z.string().min(1, "Lavozimni kiriting"),
  shift_start: z.string().min(1, "Boshlanish vaqtini tanlang"),
  shift_end: z.string().min(1, "Tugash vaqtini tanlang"),
  shift_number: z.number().int().min(1, "Kamida 1"),
  hourly_rate: z.number().min(0, "Manfiy bo'lishi mumkin emas"),
  branch_id: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface AddEditEmployeeModalProps {
  open: boolean;
  employee?: Employee | null;
  onClose: () => void;
  onSave: (data: EmployeeFormValues) => void;
  isSaving?: boolean;
}

const inputCls = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all bg-white";

// --- formatlash yordamchilari ---
const onlyDigits = (s: string) => s.replace(/\D/g, "");
const nationalPart = (full: string) => onlyDigits(full || "").replace(/^998/, "").slice(0, 9);
const formatNational = (d: string) => [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(" ");
const formatMoney = (n: number | string) => onlyDigits(String(n ?? "")).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

function FormField({ label, icon, error, children }: { label: string; icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">{icon}{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// Radix Select bo'sh string ("") qiymatli Item'ga ruxsat bermaydi — "filial yo'q"
// uchun sentinel ishlatamiz va yuborishda undefined'ga aylantiramiz.
const NO_BRANCH = "__none__";

const EMPTY: EmployeeFormData = {
  first_name: "", last_name: "", username: "", password: "",
  phone: "", position: "", shift_start: "09:00", shift_end: "18:00",
  shift_number: 1, hourly_rate: 0, branch_id: NO_BRANCH,
};

export function AddEditEmployeeModal({ open, employee, onClose, onSave, isSaving }: AddEditEmployeeModalProps) {
  const isEdit = Boolean(employee);
  const { data: branches } = useBranches();
  const branchOptions = [
    { value: NO_BRANCH, label: "— Filial tanlanmagan —" },
    ...(branches ?? []).map((b) => ({ value: b.id, label: b.name })),
  ];

  const { register, handleSubmit, reset, control, setError, formState: { errors } } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    if (employee) {
      const rawPhone = employee.user?.phone || "";
      const nat = nationalPart(rawPhone);
      reset({
        first_name: employee.user?.first_name || "",
        last_name: employee.user?.last_name || "",
        username: employee.user?.username || "",
        password: "",
        phone: nat.length === 9 ? `+998${nat}` : "",
        position: employee.position || "",
        shift_start: (employee.shift_start || "09:00").slice(0, 5),
        shift_end: (employee.shift_end || "18:00").slice(0, 5),
        shift_number: employee.shift_number || 1,
        hourly_rate: Number(employee.hourly_rate) || 0,
        branch_id: employee.branch_id || NO_BRANCH,
      });
    } else {
      reset(EMPTY);
    }
  }, [open, employee, reset]);

  if (!open) return null;

  const onSubmit = (data: EmployeeFormData) => {
    // Yangi xodim qo'shishda parol majburiy
    if (!isEdit && !data.password) {
      setError("password", { message: "Parol majburiy" });
      return;
    }
    const toTime = (t: string) => (t.length === 5 ? `${t}:00` : t);
    onSave({
      ...data,
      shift_start: toTime(data.shift_start),
      shift_end: toTime(data.shift_end),
      password: data.password ? data.password : undefined,
      // "filial yo'q" -> backendga UUID yubormaymiz (undefined = None)
      branch_id: data.branch_id && data.branch_id !== NO_BRANCH ? data.branch_id : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] sm:max-h-none flex flex-col animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        {/* Mobil "tortish" chizig'i (drag handle) — bottom-sheet ko'rinishi */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <span className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200/50">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              {isEdit ? "Xodim ma'lumotlarini tahrirlash" : "Yangi xodim qo'shish"}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {isEdit ? `${employee?.user?.first_name ?? ""} ${employee?.user?.last_name ?? ""} profilini tahrirlash` : "Yangi jamoa a'zosini qo'shish uchun ma'lumotlarni to'ldiring"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5 flex-1 sm:max-h-[65vh] overflow-y-auto">
            <FormField label="Ism *" icon={<User size={12} className="text-slate-400" />} error={errors.first_name?.message}>
              <input {...register("first_name")} className={inputCls} placeholder="Jasur" />
            </FormField>

            <FormField label="Familiya *" icon={<User size={12} className="text-slate-400" />} error={errors.last_name?.message}>
              <input {...register("last_name")} className={inputCls} placeholder="Toshmatov" />
            </FormField>

            <FormField label="Lavozim *" icon={<Briefcase size={12} className="text-slate-400" />} error={errors.position?.message}>
              <input {...register("position")} className={inputCls} placeholder="Sotuvchi" />
            </FormField>

            {/* Telefon — +998 prefiks + formatlash */}
            <FormField label="Telefon raqami *" icon={<Phone size={12} className="text-slate-400" />} error={errors.phone?.message}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <div className="flex items-stretch rounded-lg border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/60 transition-all bg-white">
                    <span className="flex items-center px-3 bg-slate-50 text-sm font-semibold text-slate-500 border-r border-slate-200 select-none">+998</span>
                    <input
                      value={formatNational(nationalPart(field.value))}
                      onChange={(e) => {
                        const nat = onlyDigits(e.target.value).slice(0, 9);
                        field.onChange(nat ? `+998${nat}` : "");
                      }}
                      inputMode="numeric"
                      placeholder="90 123 45 67"
                      className="flex-1 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none tracking-wide"
                    />
                  </div>
                )}
              />
            </FormField>

            <FormField label="Smena boshlanishi *" icon={<Clock size={12} className="text-slate-400" />} error={errors.shift_start?.message}>
              <Controller name="shift_start" control={control} render={({ field }) => (
                <TimePicker value={field.value} onChange={field.onChange} placeholder="Boshlanish vaqti" />
              )} />
            </FormField>

            <FormField label="Smena tugashi *" icon={<Clock size={12} className="text-slate-400" />} error={errors.shift_end?.message}>
              <Controller name="shift_end" control={control} render={({ field }) => (
                <TimePicker value={field.value} onChange={field.onChange} placeholder="Tugash vaqti" />
              )} />
            </FormField>

            <FormField label="Smena raqami *" icon={<Hash size={12} className="text-slate-400" />} error={errors.shift_number?.message}>
              <input {...register("shift_number", { valueAsNumber: true })} type="number" min={1} className={inputCls} placeholder="1" />
            </FormField>

            <FormField label="Filial" icon={<Building2 size={12} className="text-slate-400" />} error={errors.branch_id?.message}>
              <Controller name="branch_id" control={control} render={({ field }) => (
                <CustomSelect
                  options={branchOptions}
                  value={field.value || NO_BRANCH}
                  onValueChange={field.onChange}
                  placeholder="Filial tanlang"
                />
              )} />
            </FormField>

            {/* Soatlik stavka — ajratgichli pul ko'rinishi */}
            <FormField label="Soatlik stavka *" icon={<Coins size={12} className="text-slate-400" />} error={errors.hourly_rate?.message}>
              <Controller
                name="hourly_rate"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <input
                      value={field.value ? formatMoney(field.value) : ""}
                      onChange={(e) => field.onChange(Number(onlyDigits(e.target.value)) || 0)}
                      inputMode="numeric"
                      placeholder="15 000"
                      className={`${inputCls} pr-20 font-semibold tabular-nums`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">so'm/soat</span>
                  </div>
                )}
              />
            </FormField>

            <FormField label="Foydalanuvchi nomi *" icon={<Shield size={12} className="text-slate-400" />} error={errors.username?.message}>
              <input {...register("username")} className={inputCls} placeholder="jasur_dev" />
            </FormField>

            <FormField label={isEdit ? "Parol (ixtiyoriy)" : "Parol *"} icon={<Lock size={12} className="text-slate-400" />} error={errors.password?.message}>
              <input {...register("password")} type="password" className={inputCls} placeholder={isEdit ? "O'zgartirmaslik uchun bo'sh qoldiring" : "••••••••"} />
            </FormField>
          </div>

          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200/50 bg-slate-50 shrink-0
            flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <span className="text-xs text-slate-400 text-center sm:text-left">* majburiy maydonlar</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} disabled={isSaving} className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm rounded-xl sm:rounded-lg border border-slate-200 text-slate-700 hover:bg-white transition-all disabled:opacity-50 font-medium">
                Bekor qilish
              </button>
              <button type="submit" disabled={isSaving}
                className="flex-[1.5] sm:flex-none px-5 py-2.5 sm:py-2 text-sm rounded-xl sm:rounded-lg font-semibold text-white transition-all sm:min-w-[120px] flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-70 shadow-lg shadow-primary/20">
                {isSaving ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{isEdit ? "Saqlanmoqda…" : "Qo'shilmoqda…"}</>
                ) : isEdit ? "O'zgarishlarni saqlash" : "Xodim qo'shish"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
