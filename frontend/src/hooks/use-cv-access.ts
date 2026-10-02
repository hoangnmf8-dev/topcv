"use client";
import { useQuery } from "@tanstack/react-query";
import { useAccountStore } from "@/stores/auth.store";
import { billingService } from "@/services/billing.service";
export function useCvAccess() {
  const account = useAccountStore(s => s.account);
  return useQuery({ queryKey: ["cv-access", account?.id], enabled: account?.role === "candidate", queryFn: billingService.access, refetchInterval: 30000 });
}
