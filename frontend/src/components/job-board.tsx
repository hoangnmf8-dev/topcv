"use client";
import * as React from "react";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  SearchX,
  Sparkles,
} from "lucide-react";
import { JobCard } from "@/components/job-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import jobPostService from "@/services/job-post.service";
import { jobPostListSortKey } from "@/cache-key";
import { toJobCard } from "@/lib/utils";

const PAGE_SIZE = 8;

function JobCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex gap-4">
        <Skeleton className="size-16 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-2/5" />
        </div>
      </div>
      <Skeleton className="mt-4 h-12 w-full" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-7 w-28" />
      </div>
      <Skeleton className="mt-4 h-px w-full" />
      <Skeleton className="mt-4 h-4 w-1/2" />
    </div>
  );
}

export function JobBoard() {
  const router = useRouter();
  const [sort, setSort] = React.useState("newest");
  const [page, setPage] = React.useState(1);
  const { saved, toggle } = useSavedJobs();
  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useQuery({
    queryKey: [...jobPostListSortKey(sort, page), 8],
    queryFn: ({ signal }) =>
      jobPostService.getJobPostList(sort, page, 8, signal),
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
  const visibleJobs = (data ?? []).map(toJobCard);
  const previousPage = () => setPage((current) => Math.max(1, current - 1));
  const nextPage = () => setPage((current) => current + 1);
  const reset = () => {
    setSort("newest");
    setPage(1);
  };
  return (
    <section id="jobs" className="bg-slate-50/70 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Cơ hội dành cho bạn
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Việc làm nổi bật
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Tin tuyển dụng mới từ các doanh nghiệp uy tín, cập nhật liên tục.
            </p>
          </div>
          <Select
            modal={false}
            value={sort}
            onValueChange={(value) => {
              if (value) {
                setSort(value);
                setPage(1);
              }
            }}
          >
            <SelectTrigger
              aria-label="Sắp xếp việc làm"
              className="h-11 w-52 gap-2 rounded-xl border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:border-emerald-300"
            >
              <ArrowUpDown className="size-4 shrink-0 text-slate-400" />
              <SelectValue>
                {
                  {
                    newest: "Mới nhất",
                    salary: "Lương cao nhất",
                    hot: "Tin HOT",
                  }[sort]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              align="end"
              alignItemWithTrigger={false}
              className="w-52 rounded-xl p-1.5"
            >
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="salary">Lương cao nhất</SelectItem>
              <SelectItem value="hot">Tin HOT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              <b className="font-semibold text-slate-900">
                {visibleJobs.length}{" "}
              </b>
              việc làm trên trang {page}
            </p>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Cập nhật hôm nay
            </span>
          </div>
          {isError ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-white p-8 text-center"
            >
              <p className="text-red-600">
                {error.message || "Không thể tải danh sách việc làm"}
              </p>
              <button
                type="button"
                disabled={isFetching}
                onClick={() => refetch()}
                className="mt-4 font-semibold text-emerald-700 disabled:opacity-50"
              >
                Thử lại
              </button>
              {page > 1 && (
                <button
                  type="button"
                  onClick={previousPage}
                  className="ml-4 font-semibold text-emerald-700"
                >
                  Trang trước
                </button>
              )}
            </div>
          ) : isPending ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 8 }, (_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          ) : visibleJobs.length > 0 ? (
            <>
              <div
                aria-busy={isFetching}
                className={`grid gap-4 md:grid-cols-2 ${isPlaceholderData ? "opacity-60" : ""}`}
              >
                {visibleJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    saved={saved.has(job.id)}
                    onSelect={() => router.push(`/jobs/${job.id}`)}
                    onToggleSave={() => toggle(job.id)}
                  />
                ))}
              </div>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:justify-between">
                <button
                  type="button"
                  onClick={() => router.push("/discover/jobs-by-field")}
                  className="text-sm font-semibold text-slate-800 underline underline-offset-4 transition hover:text-emerald-700"
                >
                  Xem tất cả
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Trang việc làm trước"
                    onClick={previousPage}
                    disabled={page === 1 || isFetching || isPlaceholderData}
                    className="grid size-9 place-items-center rounded-full border border-emerald-600 text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <span className="min-w-20 text-center text-sm text-slate-500">
                    Trang <b className="text-emerald-600">{page}</b>
                  </span>
                  <button
                    type="button"
                    aria-label="Trang việc làm tiếp theo"
                    onClick={nextPage}
                    disabled={
                      isFetching ||
                      isPlaceholderData ||
                      (data?.length ?? 0) < PAGE_SIZE
                    }
                    className="grid size-9 place-items-center rounded-full border border-emerald-600 text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                  >
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center sm:px-6 sm:py-16">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-slate-100 text-slate-500">
                <SearchX className="size-6" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">
                Chưa tìm thấy việc làm phù hợp
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Hãy thử thay đổi từ khóa hoặc điều kiện tìm kiếm để khám phá
                thêm cơ hội.
              </p>
              {page > 1 && (
                <button
                  type="button"
                  onClick={previousPage}
                  className="mr-4 font-semibold text-emerald-700"
                >
                  Trang trước
                </button>
              )}
              <button
                type="button"
                onClick={reset}
                className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Về trang đầu
              </button>
            </div>
          )}
        </div>
      </div>

    </section>
  );
}
