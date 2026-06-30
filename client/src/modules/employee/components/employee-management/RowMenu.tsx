import { MoreVertical, Eye, Pencil, UserCheck, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/shared/ui/dropdown-menu";

export function RowMenu({ onView, onEdit, onToggleActive, isActive }: { onView: () => void; onEdit: () => void; onToggleActive: () => void; isActive: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label="Amallar menyusi" className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
          <MoreVertical size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-48 rounded-xl">
        <DropdownMenuItem onClick={onView} className="gap-3 cursor-pointer text-slate-700"><Eye size={14} /> Profilni ko'rish</DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit} className="gap-3 cursor-pointer text-slate-700"><Pencil size={14} /> Tahrirlash</DropdownMenuItem>
        {isActive ? (
          <DropdownMenuItem onClick={onToggleActive} className="gap-3 cursor-pointer text-destructive focus:text-destructive"><Trash2 size={14} /> Faolsizlantirish</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onToggleActive} className="gap-3 cursor-pointer text-success focus:text-success"><UserCheck size={14} /> Faollashtirish</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
