import { MoreVertical, Eye, Pencil, UserMinus, UserCheck, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/shared/ui/dropdown-menu";

export function RowMenu({ onView, onEdit, onToggleActive, isActive, onDelete }: { onView: () => void; onEdit: () => void; onToggleActive: () => void; isActive: boolean; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
          <MoreVertical size={15} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-48 rounded-xl">
        <DropdownMenuItem onClick={onView} className="gap-3 cursor-pointer text-slate-700"><Eye size={14} /> Profilni ko'rish</DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit} className="gap-3 cursor-pointer text-slate-700"><Pencil size={14} /> Tahrirlash</DropdownMenuItem>
        {isActive ? (
          <DropdownMenuItem onClick={() => {onToggleActive(), onDelete()}} className="gap-3 cursor-pointer text-red-600 focus:text-red-700"><Trash2 size={14} /> Faolsizlantirish</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onToggleActive} className="gap-3 cursor-pointer text-emerald-600 focus:text-emerald-700"><UserCheck size={14} /> Faollashtirish</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
