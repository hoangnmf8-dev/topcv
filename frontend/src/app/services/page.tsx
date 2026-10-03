import { PlanCards } from "@/components/billing-panel";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-3 text-3xl font-bold">
          Gói dịch vụ dành cho ứng viên
        </h1>
        <p className="mb-8 text-slate-600">
          Free cho nhu cầu cơ bản. Pro hỗ trợ nhiều CV và lượt AI hơn. Premium
          đang phát triển.
        </p>
        <PlanCards audience="candidate" />
      </section>
      <SiteFooter />
    </main>
  );
}
