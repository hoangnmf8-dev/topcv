"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useAccountStore } from "@/stores/auth.store";
import { BillingPanel } from "@/components/billing-panel";

export function BillingOrdersReturn() {
  const account = useAccountStore((state) => state.account);
  const params = useSearchParams();

  if (account?.role === "candidate") {
    const query = new URLSearchParams(params.toString());
    query.set("tab", "orders");
    // Keep orderId so the dashboard reconciles payment with the backend.
    redirect(`/candidate?${query.toString()}`);
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <BillingPanel />
    </main>
  );
}
