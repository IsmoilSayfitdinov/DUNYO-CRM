export type Role = "leader" | "employee";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  username: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface SessionInfo {
  id: string;
  device: string;
  ip_address: string | null;
  last_used_at: string;
  created_at: string;
  is_current: boolean;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}
