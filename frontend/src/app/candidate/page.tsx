import { PortalDashboard } from "@/components/portal-dashboard";
import { useAccountStore } from "@/stores/auth.store";
export default function CandidatePage() {
  return <PortalDashboard mode="candidate" />;
}
