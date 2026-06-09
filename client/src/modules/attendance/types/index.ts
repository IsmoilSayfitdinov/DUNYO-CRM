/** Davomat holati. Backend "came" qaytaradi; boshqa qiymatlar ham bo'lishi mumkin. */
export type AttendanceStatus = string;

/** GET /attendance/* qaytaradigan davomat yozuvi */
export interface Attendance {
  id: string;
  employee_id: string;
  status: AttendanceStatus;
  work_date: string;
  check_in: string | null;
  check_out: string | null;
  duration_hours: number;
  earned_amount: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** POST /attendance/scan tanasi — branch_id (QR'dan) + GPS majburiy */
export interface ScanDto {
  branch_id: string;
  latitude: number;
  longitude: number;
  notes?: string;
}

/** PATCH /attendance/{id} tanasi */
export interface UpdateAttendanceDto {
  status?: AttendanceStatus;
  check_in?: string | null;
  check_out?: string | null;
  notes?: string;
}

/** Davomat ro'yxati uchun query parametrlari */
export interface AttendanceQuery {
  limit?: number;
  offset?: number;
  year?: number;
  month?: number;
}

/** GET /attendance/analytics/trends javobi (kunlik trend) */
export interface AttendanceTrendPoint {
  date: string;
  present: number;
  late: number;
  absent: number;
}

/** GET /attendance/me/weekly javobi (oy ichidagi haftalar bo'yicha) */
export interface AttendanceWeekly {
  week: string; // "W1"
  hours: number;
  days: number;
}

/** GET /attendance/report — oylik davomat hisoboti (har xodim bo'yicha). */
export interface AttendanceReportRow {
  employee_id: string;
  employee_name: string;
  present: number;
  late: number;
  on_time: number;
  total: number;
}
