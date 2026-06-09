export type DashboardPeriod = "today" | "week" | "month";

/** GET /dashboard/overview */
export interface DashboardOverview {
  total_employees: number;
  present_today: number;
  absent_today: number;
  late_today: number;
  attendance_rate: number;
  total_payroll: string;
}

/** GET /dashboard/alerts */
export interface DashboardAlert {
  type: string;
  severity: "info" | "warning" | "danger" | "critical";
  message: string;
  employee_id?: string | null;
}

/** GET /dashboard/activity */
export interface DashboardActivity {
  type: string;
  employee_name: string;
  timestamp: string;
  message: string;
}

/** GET /dashboard/top-employees */
export interface TopEmployeeItem {
  employee_id: string;
  name: string;
  position: string | null;
  score: number;
  present_days: number;
  total_days: number;
}
