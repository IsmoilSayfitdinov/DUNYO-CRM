/** AddEditEmployeeModal forma qiymatlari (real backend DTO'ga mos). */
export interface EmployeeFormValues {
  first_name: string;
  last_name: string;
  username: string;
  password?: string;
  phone: string;
  position: string;
  shift_start: string; // "HH:MM:00"
  shift_end: string;   // "HH:MM:00"
  shift_number: number;
  hourly_rate: number;
  branch_id?: string;
}
