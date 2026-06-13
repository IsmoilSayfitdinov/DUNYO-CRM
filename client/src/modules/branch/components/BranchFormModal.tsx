import { useState, useEffect } from "react";
import { X, Building2, MapPin, Ruler, LocateFixed, Loader2, AlertCircle } from "lucide-react";
import { useCreateBranch, useUpdateBranch } from "@/modules/branch";
import type { Branch } from "@/modules/branch";
import { MapPicker } from "@/shared/ui/MapPicker";

const inputCls = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all bg-white";

export function BranchFormModal({ open, onClose, branch }: { open: boolean; onClose: () => void; branch?: Branch | null }) {
  const isEdit = !!branch;
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState("150");
  const [locating, setLocating] = useState(false);
  const [geoErr, setGeoErr] = useState("");
  const create = useCreateBranch();
  const update = useUpdateBranch();
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (!open) return;
    setGeoErr("");
    if (branch) {
      setName(branch.name);
      setLat(String(branch.latitude));
      setLng(String(branch.longitude));
      setRadius(String(branch.radius_meters));
    } else {
      setName(""); setLat(""); setLng(""); setRadius("150");
    }
  }, [open, branch]);

  if (!open) return null;

  const useMyLocation = () => {
    if (!navigator.geolocation) { setGeoErr("Brauzer geolokatsiyani qo'llab-quvvatlamaydi"); return; }
    setLocating(true); setGeoErr("");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude.toFixed(6)); setLng(pos.coords.longitude.toFixed(6)); setLocating(false); },
      (err) => { setGeoErr(`Lokatsiyani olib bo'lmadi: ${err.message}`); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-primary" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">{isEdit ? "Filialni tahrirlash" : "Yangi filial qo'shish"}</h3>
          </div>
          <button onClick={onClose} aria-label="Yopish" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
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
            {geoErr && (
              <p className="text-xs text-destructive flex items-center gap-1.5"><AlertCircle size={12} /> {geoErr}</p>
            )}
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

        <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-slate-200/50 bg-slate-50">
          <button onClick={onClose} disabled={pending} className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-white transition-all disabled:opacity-50 font-medium">
            Bekor qilish
          </button>
          <button onClick={submit} disabled={!valid || pending}
            className="px-5 py-2 text-sm rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 min-w-[120px]">
            {pending ? <><Loader2 size={15} className="animate-spin" /> Saqlanmoqda…</> : isEdit ? "Saqlash" : "Filial qo'shish"}
          </button>
        </div>
      </div>
    </div>
  );
}
