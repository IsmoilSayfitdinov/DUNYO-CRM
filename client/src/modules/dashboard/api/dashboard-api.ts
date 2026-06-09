import { apiClient } from "@/shared/lib/api";
import type { DashboardOverview, DashboardAlert, DashboardActivity, DashboardPeriod, TopEmployeeItem } from "../types";

export const dashboardApi = {
  /** GET /dashboard/top-employees?limit= — reyting (ball bo'yicha) */
  getTopEmployees: (limit = 5) =>
    apiClient.get<TopEmployeeItem[]>("/dashboard/top-employees", { params: { limit } }).then((r) => r.data),

  /** GET /dashboard/overview?period=today|week|month */
  getOverview: (period: DashboardPeriod = "today") =>
    apiClient.get<DashboardOverview>("/dashboard/overview", { params: { period } }).then((r) => r.data),

  /** GET /dashboard/alerts */
  getAlerts: () =>
    apiClient.get<DashboardAlert[]>("/dashboard/alerts").then((r) => r.data),

  /** GET /dashboard/activity?limit= */
  getActivity: (limit = 20) =>
    apiClient.get<DashboardActivity[]>("/dashboard/activity", { params: { limit } }).then((r) => r.data),
};
