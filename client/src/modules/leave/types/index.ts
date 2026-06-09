export type LeaveStatus = "pending" | "approved" | "rejected";

/** GET /leave-requests javobi */
export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string | null;
  type: string | null;
  start_date: string;
  end_date: string;
  days: number;
  reason: string | null;
  reject_reason: string | null;
  status: LeaveStatus;
  created_at: string;
}

/** POST /leave-requests/ tanasi */
export interface LeaveRequestCreateDto {
  type?: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  reason?: string;
}
