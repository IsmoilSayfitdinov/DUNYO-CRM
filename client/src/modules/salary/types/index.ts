/** GET /salary-history/* qaytaradigan ish haqi yozuvi. Pul maydonlari string ("15000.00"). */
export interface SalaryHistory {
  id: string;
  employee_id: string;
  month: string;
  total_hours: string;
  base_salary: string;
  final_salary: string;
  bonus: string;
  days_worked: number;
  is_paid: boolean;
  calculated_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

/** GET /salary-history/summary javobi (oy bo'yicha umumiy) */
export interface SalarySummary {
  total: number;
  paid_count: number;
  unpaid_count: number;
  total_paid: string;
  total_unpaid: string;
}

/** GET /salary-history/ (Get All Salary) — har bir yozuvga xodim ma'lumoti biriktirilgan. */
export interface SalaryWithEmployeeInfo extends SalaryHistory {
  employee: {
    id: string;
    position: string | null;
    user: {
      first_name: string | null;
      last_name: string | null;
      username: string;
    };
  };
}

export interface SalaryListParams {
  year?: number;
  month?: number;
  limit?: number;
  offset?: number;
}

/** GET /salary-history/trend — oylar bo'yicha umumiy ish haqi dinamikasi. */
export interface SalaryTrendPoint {
  month: string; // "YYYY-MM-DD"
  total: string; // pul (string)
}

/** Avans (advance) yoki premiya (bonus) yozuvi — har biri alohida (itemized). */
export interface SalaryAdjustment {
  id: string;
  employee_id: string;
  type: "advance" | "bonus";
  amount: string; // pul (string)
  note: string | null;
  month: string; // "YYYY-MM-DD"
  created_at: string;
}

/** POST /salary-history/adjustment tanasi — avans/premiya berish. */
export interface SalaryAdjustmentCreate {
  employee_id: string;
  type: "advance" | "bonus";
  amount: number;
  note?: string | null;
  year: number;
  month: number;
}

/** GET /salary-history/adjustments/all — jamoaviy ro'yxat (xodim ismi bilan). */
export interface SalaryAdjustmentWithEmployee extends SalaryAdjustment {
  employee_name: string;
}
