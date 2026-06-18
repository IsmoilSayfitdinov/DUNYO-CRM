import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Users, Award, AlertTriangle, TrendingDown } from "lucide-react";
import { useEmployees, type Employee } from "@/modules/employee";
import { AddEditEmployeeModal, useSaveEmployee, useDeleteEmployee, useSetEmployeeActive } from "@/modules/employee";
import { useBranches } from "@/modules/branch";
import { ConfirmActionModal } from "@/shared/ui/ConfirmActionModal";
import { StatsCards, FiltersBar, EmployeeTable } from "../components/employee-management";

const PAGE_SIZE = 8;
const ALL_BRANCHES = "all"; // Radix Select bo'sh string'ga ruxsat bermaydi — sentinel

function toRow(e: Employee, branchName: string) {
  return {
    id: e.id,
    raw: e,
    name: `${e.user.first_name} ${e.user.last_name}`.trim() || e.user.username,
    username: e.user.username,
    position: e.position || e.user.role,
    branch: branchName,
    shift: `${(e.shift_start || "").slice(0, 5)}–${(e.shift_end || "").slice(0, 5)}`,
    hourlyRate: Number(e.hourly_rate) || 0,
    score: e.score ?? 0,
    isActive: e.is_active,
  };
}

export function EmployeeManagement() {
  const navigate = useNavigate();

  const [branchFilter, setBranchFilter] = useState(ALL_BRANCHES);
  const { data: branches } = useBranches();
  const branchMap = useMemo(
    () => new Map((branches ?? []).map((b) => [b.id, b.name])),
    [branches],
  );
  const branchOptions = [
    { value: ALL_BRANCHES, label: "Barcha filiallar" },
    ...(branches ?? []).map((b) => ({ value: b.id, label: b.name })),
  ];

  const { data, isLoading, isError } = useEmployees({
    limit: 100,
    offset: 0,
    branch_id: branchFilter === ALL_BRANCHES ? undefined : branchFilter,
  });
  const rows = useMemo(
    () => (data?.items ?? []).map((e) => toRow(e, e.branch_id ? (branchMap.get(e.branch_id) ?? "—") : "—")),
    [data, branchMap],
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<ReturnType<typeof toRow> | null>(null);

  const saveEmployee = useSaveEmployee(editTarget?.id);
  const deleteEmployee = useDeleteEmployee();
  const setActive = useSetEmployeeActive();

  const handleSave = (values: any) => {
    saveEmployee.mutate(values, {
      onSuccess: () => { setModalOpen(false); setEditTarget(null); },
    });
  };

  const filtered = rows.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = e.name.toLowerCase().includes(q) || e.username.toLowerCase().includes(q) || e.position.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || (statusFilter === "active" ? e.isActive : !e.isActive);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const avgScore = rows.length ? Math.round(rows.reduce((a, e) => a + e.score, 0) / rows.length) : 0;

  const statsCards = [
    { label: "Jami xodimlar", value: data?.total ?? rows.length, icon: Users, color: "var(--primary)" },
    { label: "Eng yaxshi natija", value: rows.filter((e) => e.score >= 90).length, icon: Award, color: "var(--success)" },
    { label: "Past natija", value: rows.filter((e) => e.score < 80).length, icon: AlertTriangle, color: "var(--destructive)" },
    { label: "O'rtacha ball", value: avgScore, icon: TrendingDown, color: "var(--warning)" },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">{"Xodimlarni boshqarish"}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{"Xodimlarni boshqarish — qo'shish, tahrirlash, o'chirish"}</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground text-xs sm:text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-md h-10 sm:h-11 w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus size={15} /> {"Xodim qo'shish"}
        </button>
      </div>

      <StatsCards statsCards={statsCards} />

      <FiltersBar
        search={search}
        onSearchChange={(val: string) => { setSearch(val); setPage(1); }}
        statusFilter={statusFilter}
        onStatusChange={(val: string) => { setStatusFilter(val); setPage(1); }}
        branchFilter={branchFilter}
        onBranchChange={(val: string) => { setBranchFilter(val); setPage(1); }}
        branchOptions={branchOptions}
        count={filtered.length}
      />

      <EmployeeTable
        isLoading={isLoading}
        isError={isError}
        paginated={paginated}
        filtered={filtered}
        page={page}
        pageSize={PAGE_SIZE}
        totalPages={totalPages}
        onPageChange={setPage}
        onAdd={() => { setEditTarget(null); setModalOpen(true); }}
        onView={(emp: any) => navigate(`/leader/employees/${emp.id}`)}
        onEdit={(emp: any) => { setEditTarget(emp.raw); setModalOpen(true); }}
        onToggleActive={(emp: any) => setActive.mutate({ id: emp.id, isActive: !emp.isActive })}
        onDelete={(emp: any) => setDeactivateTarget(emp)}
      />

      <AddEditEmployeeModal
        open={modalOpen}
        employee={editTarget}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        isSaving={saveEmployee.isPending}
      />

      <ConfirmActionModal
        open={Boolean(deactivateTarget)}
        variant="danger"
        title={`${deactivateTarget?.name}ni o'chirish?`}
        description={`Bu amal ${deactivateTarget?.name}ni serverdan o'chiradi.`}
        confirmLabel="Ha, o'chirish"
        busy={deleteEmployee.isPending}
        onConfirm={() => {
          if (!deactivateTarget) return;
          deleteEmployee.mutate(deactivateTarget.id, { onSuccess: () => setDeactivateTarget(null) });
        }}
        onClose={() => setDeactivateTarget(null)}
      />
    </div>
  );
}
