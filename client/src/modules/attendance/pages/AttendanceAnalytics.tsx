import { useState } from "react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { useAttendanceTrends } from "@/modules/attendance";
import { useTopEmployees } from "@/modules/dashboard";
import { DateRange } from "react-day-picker";
import {
  AnalyticsHeader,
  FilterBar,
  StatsCards,
  DailyTrendChart,
  DisciplineRankingTable,
} from "../components/attendance-analytics";

const PAGE_SIZE = 10;

/** Date → local "YYYY-MM-DD" (avoids UTC off-by-one from toISOString). */
const toLocalYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function AttendanceAnalytics() {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);
    return { from, to };
  });
  const [page, setPage] = useState(1);

  // Real API: davomat trendi (tanlangan sana oralig'i bo'yicha) — grafik + statistika
  const fromStr = dateRange?.from ? toLocalYMD(dateRange.from) : undefined;
  const toStr = dateRange?.to ? toLocalYMD(dateRange.to) : undefined;
  const { data: trends } = useAttendanceTrends(fromStr, toStr);

  // Statistika kartalari — trends'dan yig'iladi (sana oralig'i bilan birga o'zgaradi)
  const sumPresent = (trends ?? []).reduce((a, t) => a + (t.present || 0), 0);
  const sumLate = (trends ?? []).reduce((a, t) => a + (t.late || 0), 0);
  const sumAbsent = (trends ?? []).reduce((a, t) => a + (t.absent || 0), 0);
  const total = sumPresent + sumLate + sumAbsent;
  const avgRate = total > 0 ? Math.round((sumPresent / total) * 100) : 0;

  const rangeLabel = dateRange?.from
    ? dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime()
      ? `${format(dateRange.from, "d MMM", { locale: uz })} – ${format(dateRange.to, "d MMM, yyyy", { locale: uz })}`
      : format(dateRange.from, "d MMMM, yyyy", { locale: uz })
    : "Barcha sanalar";

  // Real API: xodimlar reytingi (ball + davomat%) — /dashboard/top-employees
  const { data: ranking } = useTopEmployees(50);
  const rankRows = (ranking ?? []).map((e) => ({
    employee_id: e.employee_id,
    name: e.name,
    position: e.position,
    score: e.score,
    attendancePct: e.total_days > 0 ? Math.round((e.present_days / e.total_days) * 100) : 0,
  }));

  const filtered = rankRows.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <AnalyticsHeader />

      <FilterBar
        search={search}
        onSearchChange={(val: string) => { setSearch(val); setPage(1); }}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <StatsCards avgRate={avgRate} totalPresent={sumPresent} totalLate={sumLate} totalAbsent={sumAbsent} rangeLabel={rangeLabel} />

      <DailyTrendChart trends={trends} rangeLabel={rangeLabel} />

      <DisciplineRankingTable
        totalCount={rankRows.length}
        paginated={paginated}
        filtered={filtered}
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        onPrev={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />
    </div>
  );
}
