"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Search, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const companies = [] as string[][];

export default function CompaniesPage() {
  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const results = useMemo(
    () =>
      companies.filter(([name, field]) =>
        `${name} ${field}`.toLowerCase().includes(keyword.toLowerCase()),
      ),
    [keyword],
  );
  const search = () => setKeyword(query.trim());
  return (
    <main className="route-home min-h-screen bg-[#f6f8f7]">
      <SiteHeader />
      <section className="bg-[radial-gradient(circle_at_top_right,#28c879,#087b43_55%,#063c27)] py-16 text-white">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
          <p className="text-sm font-bold text-emerald-100">
            TOPCV PRO COMPANY
          </p>
          <h1 className="mt-2 max-w-2xl text-3xl font-extrabold sm:text-4xl">
            Tìm đúng nơi để phát triển sự nghiệp
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50">
            Tìm hiểu câu chuyện thương hiệu, môi trường làm việc và những cơ hội
            tuyển dụng đang mở.
          </p>
          <div className="mt-7 flex max-w-xl items-center gap-3 rounded-2xl bg-white p-2 text-slate-700 shadow-xl">
            <Search className="ml-2 size-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              className="h-10 flex-1 bg-transparent text-sm outline-none"
              placeholder="Tìm công ty hoặc lĩnh vực"
            />
            <button
              onClick={search}
              className="rounded-xl bg-[#00b14f] px-4 py-2.5 text-sm font-bold text-white"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {keyword ? `Kết quả cho “${keyword}”` : "Thương hiệu tiêu biểu"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {results.length} công ty phù hợp và đang có cơ hội tuyển dụng.
            </p>
          </div>
          {keyword && (
            <button
              onClick={() => {
                setQuery("");
                setKeyword("");
              }}
              className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 text-sm font-bold"
            >
              <X className="size-4" />
              Xóa lọc
            </button>
          )}
        </div>
        {results.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map(([name, field], i) => (
              <Link
                href={`/companies/${name.toLowerCase().replaceAll(" ", "-")}`}
                key={name}
                className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#00b14f]/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-xl bg-[#e7f9ef] text-lg font-black text-[#087b43]">
                    {name
                      .split(" ")
                      .map((x) => x[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                    Pro Company
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{name}</h3>
                <p className="mt-1 text-sm text-slate-500">{field}</p>
                <p className="mt-5 flex items-center gap-1.5 text-sm font-bold text-[#008f40]">
                  <Building2 className="size-4" />
                  {12 + i * 5} việc đang tuyển
                  <ArrowRight className="ml-auto size-4 transition group-hover:translate-x-1" />
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-white p-12 text-center text-slate-500">
            Không tìm thấy công ty phù hợp. Hãy thử từ khóa khác.
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
