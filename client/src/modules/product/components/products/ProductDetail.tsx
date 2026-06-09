import {
  Package, Hash, Boxes, DollarSign, CheckCircle, AlertTriangle,
} from "lucide-react";
import type { Product } from "@/modules/product";
import { InfoCell } from "./InfoCell";

interface Props {
  product: Product;
}

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("uz-UZ").format(n) + " so'm";

export function ProductDetail({ product }: Props) {
  return (
    <div className="w-full p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-success/15 flex items-center justify-center text-success shrink-0">
          <CheckCircle size={28} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-success uppercase tracking-wider">
            Topildi
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight mt-0.5">
            {product.name}
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            {product.barcode}
          </p>
        </div>
      </div>

      {/* Narx — asosiy ma'lumot */}
      <div className="flex items-center gap-2.5 p-4 rounded-xl bg-primary/5 border border-primary/10 mb-3">
        <DollarSign size={18} className="text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Narxi</p>
          <p className="text-lg font-extrabold text-slate-900">{fmtPrice(product.price)}</p>
        </div>
      </div>

      {/* Qo'shimcha ma'lumotlar */}
      <div className="grid grid-cols-2 gap-2.5">
        <InfoCell
          icon={<Boxes size={14} />}
          label="Qoldiq"
          value={String(product.stock)}
          warn={product.stock === 0}
        />
        <InfoCell
          icon={<Hash size={14} />}
          label="SKU"
          value={product.sku || "—"}
        />
        <InfoCell
          icon={<Package size={14} />}
          label="MXIK"
          value={product.mxik || "—"}
        />
      </div>

      {product.stock === 0 && (
        <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 font-medium">
            Mahsulot omborda qolmadi.
          </p>
        </div>
      )}
    </div>
  );
}
