import { PlanCards } from "@/components/billing-panel";
import { EmployerHeader } from "@/components/employer-header";
import { RoleFooter } from "@/components/role-footer";
export default function Page() { return <main className="min-h-screen bg-slate-50"><EmployerHeader /><section className="mx-auto max-w-6xl px-4 py-10"><h1 className="mb-3 text-3xl font-bold">Gói dịch vụ dành cho nhà tuyển dụng</h1><p className="mb-8 text-slate-600">Hạn mức tính theo số tin hoạt động hoặc chờ duyệt cùng lúc. Premium đang phát triển.</p><PlanCards audience="company" /></section><RoleFooter variant="employer" /></main>; }
