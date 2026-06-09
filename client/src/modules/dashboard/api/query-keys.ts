export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: (period: string) => [...dashboardKeys.all, "overview", period] as const,
  alerts: () => [...dashboardKeys.all, "alerts"] as const,
  activity: (limit: number) => [...dashboardKeys.all, "activity", limit] as const,
  topEmployees: (limit: number) => [...dashboardKeys.all, "top-employees", limit] as const,
};
