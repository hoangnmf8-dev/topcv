
import { LoadingState } from "@/components/loading-state";
import { Suspense } from "react";
import { EmployerDashboard } from "@/components/employer-dashboard";
export default function Page() {
  return <Suspense fallback={<LoadingState fullscreen />}><EmployerDashboard /></Suspense>;
}
