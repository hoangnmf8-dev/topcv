"use client";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Layers3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { topJob } from "@/cache-key";
import jobCategoryService from "@/services/job-category.service";
import { TopJob } from "@/types";

export function TopIndustries() {
  const {
    data: industries,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: [topJob],
    queryFn: jobCategoryService.getTopJob,
    retry: 3,
  });
  return (
    <section className="border-y border-slate-100 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              Khám phá cơ hội
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Top ngành nghề nổi bật
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Chọn ngành nghề để xem ngay các vị trí đang tuyển dụng.
            </p>
          </div>
          <Link
            href="/discover/jobs-by-field"
            className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Xem tất cả việc làm <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isPending &&
            Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                aria-hidden="true"
                className="rounded-2xl border border-slate-100 p-5 motion-safe:animate-pulse"
              >
                <div className="size-12 rounded-2xl bg-slate-100" />
                <div className="mt-5 h-5 w-4/5 rounded bg-slate-100" />
                <div className="mt-4 h-8 w-1/2 rounded bg-slate-100" />
                <div className="mt-5 h-4 w-2/3 rounded bg-slate-100" />
              </div>
            ))}
          {!isPending && (isError || industries?.success === false) && (
            <div className="col-span-full rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-600">
              Không thể tải ngành nghề.{" "}
              <button
                type="button"
                onClick={() => refetch()}
                className="font-semibold text-emerald-700 underline underline-offset-4"
              >
                Thử lại
              </button>
            </div>
          )}
          {!isPending && !isError && industries?.data?.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-slate-500">
              Chưa có ngành nghề nổi bật.
            </p>
          )}
          {industries?.data?.map(({ name, _count, code }: TopJob) => {
            const href = code
              ? `/discover/jobs-by-field?category=${encodeURIComponent(code)}`
              : "/discover/jobs-by-field";
            return (
              <Link
                key={code || name}
                href={href}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-emerald-950/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100 transition-colors duration-200 group-hover:bg-emerald-100"
                  >
                    <Layers3
                      aria-hidden="true"
                      className="size-6"
                      strokeWidth={1.8}
                    />
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid size-8 place-items-center rounded-full bg-slate-50 text-slate-400 transition-colors duration-200 group-hover:bg-emerald-600 group-hover:text-white"
                  >
                    <ArrowRight className="size-4 -rotate-45" />
                  </span>
                </div>
                <h3 className="mt-5 min-h-12 break-words text-base font-semibold leading-6 text-slate-900 transition-colors duration-200 group-hover:text-emerald-700">
                  {name}
                </h3>
                <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-sm text-slate-500">
                  <span className="text-2xl font-semibold tracking-tight text-emerald-700 tabular-nums">
                    {new Intl.NumberFormat("vi-VN").format(_count.jobPosts)}
                  </span>
                  việc làm
                </p>
                <span className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500 transition-colors duration-200 group-hover:text-emerald-700">
                  <BriefcaseBusiness aria-hidden="true" className="size-3.5" />
                  Khám phá cơ hội
                  <ArrowRight
                    aria-hidden="true"
                    className="ml-auto size-3.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
