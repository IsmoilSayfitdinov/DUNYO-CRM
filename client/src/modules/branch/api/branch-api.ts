import { apiClient } from "@/shared/lib/api";
import type { Branch, CreateBranchDto, UpdateBranchDto } from "../types";

export const branchApi = {
  /** GET /branches/ — mening filiallarim */
  getAll: () => apiClient.get<Branch[]>("/branches/").then((r) => r.data),

  /** POST /branches/ — yangi filial */
  create: (dto: CreateBranchDto) => apiClient.post<Branch>("/branches/", dto).then((r) => r.data),

  /** PUT /branches/{id} — filialni tahrirlash */
  update: (id: string, dto: UpdateBranchDto) =>
    apiClient.put<Branch>(`/branches/${id}`, dto).then((r) => r.data),

  delete: (id: string) => 
    apiClient.delete(`/branches/${id}`).then((r) => r.data)
};
