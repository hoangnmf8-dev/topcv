"use client";
import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { useAccountStore } from "@/stores/auth.store";
const event = "topcv:saved-jobs";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(event, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(event, callback); };
}
function read(key: string) { try { return localStorage.getItem(key) ?? "[]"; } catch { return "[]"; } }
function parse(raw: string): string[] {
  try { const value: unknown = JSON.parse(raw); return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : []; } catch { return []; }
}
export function useSavedJobs() {
  const accountId = useAccountStore(state => state.account?.id);
  const key = "topcv:saved-jobs:" + (accountId ?? "guest");
  const raw = useSyncExternalStore(subscribe, () => read(key), () => "[]");
  const saved = new Set(parse(raw));
  function toggle(id: string) {
    const next = new Set(parse(read(key)));
    if (next.has(id)) next.delete(id); else next.add(id);
    try { localStorage.setItem(key, JSON.stringify([...next])); window.dispatchEvent(new Event(event)); }
    catch { toast.error("Không thể lưu trên trình duyệt. Hãy kiểm tra quyền lưu trữ."); }
  }
  return { saved, toggle };
}
