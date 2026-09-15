import { SiteHeader } from "@/components/site-header";
import { HeroSearch } from "@/components/hero-search";
import { JobBoard } from "@/components/job-board";
import { BrandShowcase } from "@/components/brand-showcase";
import { SiteFooter } from "@/components/site-footer";
import { TopIndustries } from "@/components/top-industries";
import { Suspense } from "react";

export default function Page() {
  return (
    <main className="route-home min-h-screen bg-background">
      <SiteHeader />
      <HeroSearch />
      <TopIndustries />
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-slate-500 sm:px-6">
            Đang chuẩn bị danh sách việc làm...
          </div>
        }
      >
        <JobBoard />
      </Suspense>
      <BrandShowcase />
      <SiteFooter />
    </main>
  );
}
