export function LeaveTabs({ tab, onTabChange, pendingCount }: any) {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 border-b border-slate-200/50 px-3 sm:px-5 pb-0 pt-3 sm:pt-4 overflow-x-auto">
      {(["All", "Pending", "Approved", "Rejected"] as const).map(
        (tabValue) => (
          <button
            key={tabValue}
            onClick={() => onTabChange(tabValue)}
            className={`border-b-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              tab === tabValue
                ? "border-primary text-primary"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            {tabValue === "All" ? "Barchasi" : tabValue === "Pending" ? "Kutilayotgan" : tabValue === "Approved" ? "Tasdiqlangan" : "Rad etilgan"}
            {tabValue === "Pending" && pendingCount > 0 && (
              <span className="ml-1 sm:ml-1.5 rounded-full bg-warning/10 px-1.5 py-0.5 text-[10px] font-bold text-warning border border-warning/20">
                {pendingCount}
              </span>
            )}
          </button>
        )
      )}
    </div>
  );
}
