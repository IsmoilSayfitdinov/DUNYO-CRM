// Eslatma: `user` maydoni — session entity'dagi User bilan bir xil (backend "user").
// Bu entity'lar orasidagi yagona ruxsat etilgan bog'lanish (FSD @x cross-import).
// Sikl yo'q: session employee'ni import qilmaydi.
import type { User } from "@/modules/auth";

/** GET /employees/* qaytaradigan xodim */
export interface Employee {
  id: string;
  user_id: string;
  leader_id: string;
  branch_id: string | null;
  user: User;
  is_active: boolean;
  position: string;
  shift_start: string;
  shift_end: string;
  shift_number: number;
  hourly_rate: string;
  score: number;
  created_at: string;
  updated_at: string;
}

/** GET /employees/ query parametrlari (filial bo'yicha filter bilan) */
export interface EmployeeListParams {
  limit?: number;
  offset?: number;
  branch_id?: string;
}

/** POST /employees/ tanasi */
export interface CreateEmployeeDto {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  leader_user_id: string;
  branch_id?: string | null;
  position: string;
  shift_start: string;
  shift_end: string;
  shift_number: number;
  hourly_rate: number;
}

/** PATCH/PUT /employees/{id} tanasi */
export interface UpdateEmployeeDto {
  first_name?: string;
  last_name?: string;
  username?: string;
  phone?: string;
  is_active?: boolean;
  branch_id?: string | null;
  position?: string;
  shift_start?: string;
  shift_end?: string;
  shift_number?: number;
  hourly_rate?: number;
}
