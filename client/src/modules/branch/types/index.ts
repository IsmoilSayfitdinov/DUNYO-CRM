/** GET /branches/ qaytaradigan filial */
export interface Branch {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  leader_id: string;
  is_active: boolean;
}

/** POST /branches/ tanasi */
export interface CreateBranchDto {
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
}

/** PUT /branches/{id} tanasi — qisman update (faqat berilgan maydonlar) */
export interface UpdateBranchDto {
  name?: string;
  latitude?: number;
  longitude?: number;
  radius_meters?: number;
  is_active?: boolean;
}
