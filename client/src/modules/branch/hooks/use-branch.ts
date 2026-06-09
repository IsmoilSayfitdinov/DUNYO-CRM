import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { branchApi } from "../api/branch-api";
import { branchKeys } from "../api/query-keys";
import type { CreateBranchDto, UpdateBranchDto } from "../types";

/** Mening filiallarim */
export function useBranches() {
  return useQuery({
    queryKey: branchKeys.list(),
    queryFn: () => branchApi.getAll(),
  });
}

/** Yangi filial qo'shish */
export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBranchDto) => branchApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: branchKeys.all });
      toast.success("Filial qo'shildi");
    },
    onError: () => toast.error("Filial qo'shishda xatolik"),
  });
}

/** Filialni tahrirlash */
export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBranchDto }) => branchApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: branchKeys.all });
      toast.success("Filial yangilandi");
    },
    onError: () => toast.error("Filialni yangilashda xatolik"),
  });
}


export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string)=> branchApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: branchKeys.all });
      toast.success("Filial O'chirildi !");
    },
    onError: () => toast.error("Filialni o'chirishda xatolik"),
  });
}
