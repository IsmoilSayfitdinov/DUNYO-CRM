import { useState, useEffect } from "react";
import { X, Building2, MapPin, Ruler, LocateFixed, Loader2, AlertCircle } from "lucide-react";
import { useCreateBranch, useUpdateBranch } from "@/modules/branch";
import type { Branch } from "@/modules/branch";
import { MapPicker } from "@/shared/ui/MapPicker";
import { useGeolocation } from "@/shared/lib/useGeolocation";
import { GeoPermissionSheet } from "@/shared/ui/GeoPermissionSheet";

const inputCls = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all bg-white";

export function BranchFormModal({ open, onClose, branch }: { open: boolean; onClose: () => void; branch?: Branch | null }) {
  const isEdit = !!branch;
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState("150");
  const create = useCreateBranch();
  const update = useUpdateBranch();
  const pending = create.isPending || update.isPending;

  // Geolokatsiya logikasi shu hook ichida (xato kodlari, holat, qayta urinish).
  const geo = useGeolocation();
  // Joylashuv ruxsati paneli ochiqmi?
  const [geoSheetOpen, setGeoSheetOpen] = useState(false);
  const locating = geo.status === "locating";

  useEffect(() => {
    if (!open) return;
    geo.reset();
    setGeoSheetOpen(false);
    if (branch) {
      setName(branch.name);
      setLat(String(branch.latitude));
      setLng(String(branch.longitude));
      setRadius(String(branch.radius_meters));
    } else {
      setName(""); setLat(""); setLng(""); setRadius("150");
    }
    // geo.reset useCallback bilan barqaror — qayta-qayta ishga tushmaydi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, branch]);

  if (!open) return null;

  // Joylashuvni so'raydi; muvaffaqiyatda koordinatalarni to'ldiradi, xatoda panel ochiladi.
  const useMyLocation = async () => {
    setGeoSheetOpen(true);
    try {
      const pos = await geo.request();
      setLat(pos.latitude.toFixed(6));
      setLng(pos.longitude.toFixed(6));
      setGeoSheetOpen(false);
    } catch {
      // Xato ma'lumoti geo.error ichida — panel ochiq qoladi va xabarni ko'rsatadi.
    }
  };

  const latN = parseFloat(lat);
  const lngN = parseFloat(lng);
  const rN = parseInt(radius, 10);
  // Backend cheklovlariga moslangan: name 1–128, lat ±90, lng ±180, radius 10–5000
  const nameOk = name.trim().length >= 1 && name.trim().length <= 128;
  const latOk = !isNaN(latN) && latN >= -90 && latN <= 90;
  const lngOk = !isNaN(lngN) && lngN >= -180 && lngN <= 180;
  const radiusOk = !isNaN(rN) && rN >= 10 && rN <= 5000;
  const valid = nameOk && latOk && lngOk && radiusOk;

  const submit = () => {
    if (!valid) return;
    const payload = { name: name.trim(), latitude: latN, longitude: lngN, radius_meters: rN };
    if (isEdit && branch) {
      update.mutate({ id: branch.id, dto: payload }, { onSuccess: onClose });
    } else {
      create.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[92vh] sm:max-h-none flex flex-col">
        {/* Mobil drag handle — bottom-sheet ko'rinishi */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <span className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>
        {/* Header — xodim modalidagi sodda uslub: sarlavha + tavsif, ikonsiz */}
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200/50">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">{isEdit ? "Filialni tahrirlash" : "Yangi filial qo'shish"}</h3>
            <p className="text-sm text-slate-400 mt-0.5">{isEdit ? "Filial ma'lumotlarini yangilang" : "Davomat skaneri uchun joylashuv qo'shing"}</p>
          </div>
          <button onClick={onClose} aria-label="Yopish" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 sm:max-h-[75vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label htmlFor="branch-name" className="text-xs font-semibold text-slate-600 flex items-center gap-1.5"><Building2 size={12} className="text-slate-400" /> Filial nomi *</label>
            <input id="branch-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Masalan: Chilonzor filiali" />
          </div>

          {/* Lokatsiya — xarita */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5"><MapPin size={12} className="text-slate-400" /> Lokatsiya — xaritadan tanlang *</label>
              <button type="button" onClick={useMyLocation} disabled={locating}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 disabled:opacity-60">
                {locating ? <Loader2 size={13} className="animate-spin" /> : <LocateFixed size={13} />}
                {locating ? "Olinmoqda…" : "Joriy lokatsiya"}
              </button>
            </div>

            <MapPicker
              lat={Number.isNaN(latN) ? null : latN}
              lng={Number.isNaN(lngN) ? null : lngN}
              radius={Number.isNaN(rN) ? 0 : rN}
              onPick={(la, ln) => { setLat(la.toFixed(6)); setLng(ln.toFixed(6)); }}
            />
            <p className="text-[11px] text-slate-400">Xaritada bosing yoki qizil belgini suring. Qizil doira — ruxsat radiusi.</p>

            <div className="grid grid-cols-2 gap-3">
              <input value={lat} onChange={(e) => setLat(e.target.value)} inputMode="decimal" aria-label="Kenglik (lat)" className={inputCls} placeholder="Kenglik (lat)" />
              <input value={lng} onChange={(e) => setLng(e.target.value)} inputMode="decimal" aria-label="Uzunlik (lng)" className={inputCls} placeholder="Uzunlik (lng)" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="branch-radius" className="text-xs font-semibold text-slate-600 flex items-center gap-1.5"><Ruler size={12} className="text-slate-400" /> Ruxsat radiusi (metr) *</label>
            <input id="branch-radius" value={radius} onChange={(e) => setRadius(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={inputCls} placeholder="150" />
            <p className="text-[11px] text-slate-400">Doira xaritada shu radiusni ko'rsatadi — xodim shu doira ichida bo'lsa, davomat qabul qilinadi.</p>
            {radius && !radiusOk && (
              <p className="text-xs text-destructive flex items-center gap-1.5"><AlertCircle size={12} /> Radius 10–5000 metr oralig'ida bo'lsin</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/80 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <button onClick={onClose} disabled={pending} className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50 font-medium">
            Bekor qilish
          </button>
          <button onClick={submit} disabled={!valid || pending}
            className="flex-[1.5] sm:flex-none px-5 py-2.5 sm:py-2 text-sm rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 sm:min-w-[130px] shadow-lg shadow-primary/25">
            {pending ? <><Loader2 size={15} className="animate-spin" /> Saqlanmoqda…</> : isEdit ? "Saqlash" : "Filial qo'shish"}
          </button>
        </div>
      </div>

      {/* Joylashuv ruxsati paneli — pastdan chiqadi */}
      <GeoPermissionSheet
        open={geoSheetOpen}
        onOpenChange={setGeoSheetOpen}
        locating={locating}
        error={geo.error}
        onRequest={useMyLocation}
      />
    </div>
  );
}
