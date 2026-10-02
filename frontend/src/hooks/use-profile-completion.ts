"use client";
import { useQuery } from "@tanstack/react-query";
import { httpRequest } from "@/lib/utils";
import { useAccountStore } from "@/stores/auth.store";
export type Completion = {
  percentage: number;
  items: { code: string; label: string; points: number; completed: boolean }[];
  missing: { code: string; label: string; points: number }[];
};
export function useProfileCompletion() {
  const account = useAccountStore((state) => state.account);
  return useQuery({
    queryKey: ["profile-completion", account?.id],
    enabled: account?.role === "candidate",
    queryFn: async ({ signal }) =>
      (
        await httpRequest.get<{ data: Completion }>(
          "/candidate/me/completion",
          { signal },
        )
      ).data.data,
  });
}
