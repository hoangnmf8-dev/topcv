"use client";
import { useQuery } from "@tanstack/react-query";
import { useAccountStore } from "@/stores/auth.store";
import service from "@/services/application.service";
export function useApplicationStatus(jobPostId: string, enabled = true) {
  const account = useAccountStore((state) => state.account);
  return useQuery({
    queryKey: ["application-status", account?.id, jobPostId],
    enabled: enabled && !!jobPostId && account?.role === "candidate",
    queryFn: ({ signal }) => service.status(jobPostId, signal),
  });
}
