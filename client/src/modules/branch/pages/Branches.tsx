import { useState } from "react";
import { MapPin, Plus, Building2, Ruler, ExternalLink, Pencil, QrCode, Delete, Trash } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useBranches, useDeleteBranch } from "@/modules/branch";
import type { Branch } from "@/modules/branch";
import { BranchFormModal } from "../components/BranchFormModal";
import { BranchQrModal } from "../components/BranchQrModal";
import { ConfirmActionModal } from "@/shared/ui/ConfirmActionModal";

export function Branches() {
  const { data, isLoading, isError } = useBranches();
  const {mutate} = useDeleteBranch()
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [qrBranch, setQrBranch] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState<Branch | null>(null);
  const branches = data ?? [];

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (b: Branch) => { setEditing(b); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };
  
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 ">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Filiallar</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Magazin/filial joylashuvlari — davomat skaneri shu radius bo'yicha tekshiriladi</p>
        </div>
        <button
          onClick={openCreate}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
        >
          <Plus size={16} /> Yangi filial
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200"><EmptyState variant="loading" title="Yuklanmoqda…" description="Filiallar olinmoqda" /></div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-slate-200"><EmptyState variant="error" title="Yuklab bo'lmadi" description="Filiallarni yuklab bo'lmadi." /></div>
      ) : branches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <EmptyState icon={Building2} title="Filial yo'q" description="Hali filial qo'shilmagan. Davomat lokatsiyasi uchun birinchi filialni qo'shing." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-slate-900 truncate">{b.name}</h3>
                </div>
                <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${b.is_active ? "bg-success/10 text-success border-success/20" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                  {b.is_active ? "Faol" : "Nofaol"}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span className="tabular-nums truncate">{b.latitude.toFixed(5)}, {b.longitude.toFixed(5)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Ruler size={14} className="text-slate-400 shrink-0" />
                  <span>Radius: <span className="font-semibold text-slate-800">{b.radius_meters} m</span></span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <a
                  href={`https://maps.google.com/?q=${b.latitude},${b.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80"
                >
                  Xaritada ko'rish <ExternalLink size={12} />
                </a>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQrBranch(b)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-red-700 border border-primary/20 bg-primary/5 rounded-lg px-2.5 py-1.5 hover:bg-primary/10 transition-all"
                  >
                    <QrCode size={12} /> QR
                  </button>
                  <button
                    onClick={() => openEdit(b)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 transition-all"
                  >
                    <Pencil size={12} /> Tahrirlash
                  </button>
                  <button
                    onClick={() => setDeleting(b)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 transition-all"
                  >
                    <Trash color="red" size={12} /> O'chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BranchFormModal open={modalOpen} branch={editing} onClose={closeModal} />
      <BranchQrModal open={!!qrBranch} branch={qrBranch} onClose={() => setQrBranch(null)} />
      <ConfirmActionModal
        open={!!deleting}
        variant="danger"
        title="Filialni o'chirish"
        description={`«${deleting?.name ?? ""}» filiali o'chiriladi. Bu filialdagi xodimlar filialdan ajratiladi (o'chmaydi) va qayta biriktirilmaguncha davomat belgilay olmaydi. Bu amalni qaytarib bo'lmaydi.`}
        confirmLabel="Ha, o'chirish"
        cancelLabel="Bekor qilish"
        onConfirm={() => { if (deleting) mutate(deleting.id); }}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
