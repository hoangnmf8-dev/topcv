import { LoadingState } from "@/components/loading-state";
import { Suspense } from "react";
import { PortalDashboard } from "@/components/portal-dashboard";
export default function Page() {
  return (
    <Suspense fallback={<LoadingState fullscreen />}>
      <PortalDashboard mode="candidate" />
    </Suspense>
  );
}
