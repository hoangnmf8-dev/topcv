"use client";

import { useRef, useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { logoutAction } from "@/actions/auth.action";
import { useAccountStore } from "@/stores/auth.store";
import { useCandidateStore } from "@/stores/candidate.store";
import { useCompanyStore } from "@/stores/company.store";

export function LogoutButton() {
  const [pending, setPending] = useState(false);
  const lock = useRef(false);
  const client = useQueryClient();
  async function logout() {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    try {
      const result = await logoutAction();
      if (!result.success) throw new Error(result.message);
      await client.cancelQueries();
      useAccountStore.getState().reset();
      useCandidateStore.getState().reset();
      useCompanyStore.getState().reset();
      client.clear();
      // A full navigation also closes socket connections and clears local UI state.
      window.location.replace("/login");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể đăng xuất. Vui lòng thử lại.",
      );
      lock.current = false;
      setPending(false);
    }
  }
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void logout()}
      className="mt-3 flex w-full items-center gap-3 rounded-xl border-t border-slate-100 px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      {pending ? "Đang đăng xuất..." : "Đăng xuất"}
    </button>
  );
}
