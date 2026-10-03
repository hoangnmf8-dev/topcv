"use client";

import { useSearchParams } from "next/navigation";

export function useDashboardTab(
  tabs: readonly (readonly [string, ...unknown[]])[],
) {
  const params = useSearchParams();
  const requested = params.get("tab");
  const tab = tabs.some(([id]) => id === requested) ? requested! : "overview";

  function setTab(id: string) {
    if (!tabs.some(([key]) => key === id)) return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    if (url.href !== window.location.href)
      window.history.pushState(null, "", url);
  }

  return [tab, setTab] as const;
}
