import { AdminDashboard } from "@/components/admin-dashboard";
import { Suspense } from "react";
export default function AdminPage() {
  return <Suspense fallback={<p className="p-8">Đang tải trang quản trị…</p>}><AdminDashboard/></Suspense>;
}
