"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAccountStore } from "@/stores/auth.store";
import service from "@/services/saved-job.service";
const locks = new Set<string>();
export function useSavedJobs() {
  const account = useAccountStore(state => state.account);
  const accountId = account?.role === "candidate" ? account.id : undefined;
  const client = useQueryClient();
  const router = useRouter();
  const key = ["saved-job-ids", accountId];
  const query = useQuery({ queryKey: key, enabled: !!accountId, queryFn: ({ signal }) => service.list(signal) });
  const mutation = useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean; accountId: string }) => saved ? service.remove(id) : service.save(id),
    onSuccess: (result, variables) => {
      const targetKey = ["saved-job-ids", variables.accountId];
      client.setQueryData<string[]>(targetKey, previous => result.saved ? [...new Set([...(previous ?? []), result.jobPostId])] : (previous ?? []).filter(id => id !== result.jobPostId));
      void client.invalidateQueries({ queryKey: targetKey });
      void client.invalidateQueries({ queryKey: ["candidate-records", variables.accountId, "saved"] });
      void client.invalidateQueries({ queryKey: ["candidate-overview", variables.accountId] });
      toast.success(result.saved ? "Đã lưu tin tuyển dụng" : "Đã bỏ lưu tin tuyển dụng");
    },
    onError: () => toast.error("Không thể cập nhật tin đã lưu. Vui lòng thử lại."),
    onSettled: (_data, _error, variables) => { locks.delete(`${variables.accountId}:${variables.id}`); },
  });
  const saved = new Set(accountId ? query.data ?? [] : []);
  function toggle(id: string) {
    if (!account) { toast.info("Vui lòng đăng nhập để lưu việc làm."); router.push("/login"); return; }
    if (!accountId) { toast.info("Chỉ tài khoản ứng viên được lưu việc làm."); return; }
    if (query.isPending || query.isError) { void query.refetch(); toast.info("Đang tải danh sách tin đã lưu. Vui lòng thử lại."); return; }
    const lock = `${accountId}:${id}`;
    if (locks.has(lock)) return;
    locks.add(lock);
    mutation.mutate({ id, accountId, saved: (client.getQueryData<string[]>(key) ?? []).includes(id) });
  }
  return { saved, toggle, isPending: mutation.isPending };
}
