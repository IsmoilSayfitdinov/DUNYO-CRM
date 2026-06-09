import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard-api";
import { dashboardKeys } from "../api/query-keys";
import type { DashboardPeriod } from "../types";

/** Umumiy ko'rsatkichlar (period bo'yicha) */
export function useDashboardOverview(period: DashboardPeriod = "today") {
  return useQuery({
    queryKey: dashboardKeys.overview(period),
    queryFn: () => dashboardApi.getOverview(period),
  });
}

/** Aqlli ogohlantirishlar */
export function useDashboardAlerts() {
  return useQuery({
    queryKey: dashboardKeys.alerts(),
    queryFn: () => dashboardApi.getAlerts(),
  });
}

/** Oxirgi harakatlar */
export function useDashboardActivity(limit = 20) {
  return useQuery({
    queryKey: dashboardKeys.activity(limit),
    queryFn: () => dashboardApi.getActivity(limit),
  });
}

/** Reyting — eng yaxshi (yoki to'liq ro'yxat) xodimlar */
export function useTopEmployees(limit = 5) {
  return useQuery({
    queryKey: dashboardKeys.topEmployees(limit),
    queryFn: () => dashboardApi.getTopEmployees(limit),
  });
}
