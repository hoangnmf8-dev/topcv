"use client";
import { toast } from "sonner";
export function useSavedJobs() {
  return { saved: new Set<string>(), toggle: (_id: string) => { toast.info("Lưu việc làm hiện chưa khả dụng."); } };
}
