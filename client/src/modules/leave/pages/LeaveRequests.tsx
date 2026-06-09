import { useState } from "react";
import { useLeaveRequests, useApproveLeave, useRejectLeave, RejectReasonModal } from "@/modules/leave";
import {
  LeaveFiltersBar,
  LeaveStatsCards,
  LeaveTabs,
  LeaveRequestCards,
  LeaveRequestsTable,
} from "../components/leave-requests";

type LeaveStatus = "All" | "Pending" | "Approved" | "Rejected";

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function LeaveRequests() {
  const { data = [] } = useLeaveRequests();
  const approve = useApproveLeave();
  const reject = useRejectLeave();

  const [tab, setTab] = useState<LeaveStatus>("All");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [rejectModeId, setRejectModeId] = useState<string | null>(null);

  const requests = data.map((r) => ({
    id: r.id,
    employee: r.employee_name ?? "—",
    type: r.type ?? "—",
    from: r.start_date,
    to: r.end_date,
    days: r.days,
    reason: r.reason ?? "",
    rejectReason: r.reject_reason ?? "",
    status: cap(r.status),
    submittedAt: new Date(r.created_at).toLocaleString("uz-UZ"),
  }));

  const filtered = requests.filter((r) => {
    const matchTab = tab === "All" || r.status === tab;
    const matchSearch = r.employee.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || r.type === typeFilter;
    return matchTab && matchSearch && matchType;
  });

  const handleApprove = (id: string) => approve.mutate(id);

  const handleReject = (reason: string) => {
    if (!rejectModeId) return;
    reject.mutate({ id: rejectModeId, reason }, { onSuccess: () => setRejectModeId(null) });
  };

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  const rejectTarget = rejectModeId ? requests.find((r) => r.id === rejectModeId) : null;

  return (
    <div className="relative space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      <LeaveFiltersBar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      <LeaveStatsCards
        total={requests.length}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <LeaveTabs tab={tab} onTabChange={setTab} pendingCount={pendingCount} />

        <LeaveRequestCards
          requests={filtered}
          onApprove={handleApprove}
          onReject={setRejectModeId}
        />

        <LeaveRequestsTable
          requests={filtered}
          onApprove={handleApprove}
          onReject={setRejectModeId}
        />
      </div>

      <RejectReasonModal
        open={rejectModeId !== null}
        employeeName={rejectTarget?.employee || ""}
        leaveType={rejectTarget?.type || ""}
        onConfirm={handleReject}
        onClose={() => setRejectModeId(null)}
      />
    </div>
  );
}
