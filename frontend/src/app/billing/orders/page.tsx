import { Suspense } from "react";
import { BillingOrdersReturn } from "@/components/billing-orders-return";
import { LoadingState } from "@/components/loading-state";

export default function Page() {
  return <Suspense fallback={<LoadingState fullscreen />}><BillingOrdersReturn /></Suspense>;
}
