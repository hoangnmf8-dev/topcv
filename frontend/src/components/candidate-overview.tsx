"use client";

import { LoadingState } from "@/components/loading-state";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAccountStore } from "@/stores/auth.store";
import { httpRequest } from "@/lib/utils";
import { ReadJob, type RecordJob } from "./candidate-records";
type Overview = {
  saved: number;
  applications: number;
  cvs: number;
  jobCount: number;
  profileCompletion: number;
  localRecommendations: boolean;
  jobs: RecordJob[];
};
export function CandidateOverview({ open }: { open: (tab: string) => void }) {
  const account = useAccountStore((s) => s.account);
  const query = useQuery({
    queryKey: ["candidate-overview", account?.id],
    enabled: !!account,
    queryFn: async ({ signal }) =>
      (await httpRequest.get<Overview>("/candidate/me/overview", { signal }))
        .data,
  });
  if (!account) return <p>Vui lòng đăng nhập tài khoản ứng viên.</p>;
  if (query.isPending) return <LoadingState message="Đang tải tổng quan..." />;
  if (query.isError)
    return (
      <p role="alert" className="rounded-2xl bg-white p-6">
        Không tải được tổng quan.{" "}
        <button
          className="text-emerald-700"
          onClick={() => void query.refetch()}
        >
          Thử lại
        </button>
      </p>
    );
  const d = query.data;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            d.jobCount,
            d.localRecommendations
              ? "Việc tại khu vực của bạn"
              : "Việc đang tuyển",
            "Còn nhận hồ sơ",
          ],
          [d.saved, "Tin đã lưu", "Tổng số đã lưu"],
          [d.applications, "Lượt ứng tuyển", "Trong 30 ngày gần nhất"],
          [
            d.profileCompletion + "%",
            "Hồ sơ hoàn thiện",
            "Theo hồ sơ hiện tại",
          ],
        ].map(([value, label, note], i) => (
          <button
            key={label}
            onClick={() =>
              i === 0
                ? window.location.assign("/discover/jobs-by-field")
                : open(i === 1 ? "saved" : i === 2 ? "applications" : "profile")
            }
            className="rounded-2xl border bg-white p-5 text-left shadow-sm hover:border-emerald-300"
          >
            <p className="text-3xl font-bold text-emerald-700">{value}</p>
            <p className="mt-3 font-semibold">{label}</p>
            <p className="mt-2 text-xs text-slate-500">{note}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold">
            {d.localRecommendations
              ? "Việc mới tại khu vực của bạn"
              : "Việc làm mới nhất"}
          </h2>
          {d.jobs.length ? (
            <ul className="divide-y">
              {d.jobs.map((job) => (
                <li className="py-4" key={job.id}>
                  <ReadJob job={job} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-slate-500">
              Chưa có việc đang tuyển phù hợp khu vực.
            </p>
          )}
          <Link
            className="text-sm font-semibold text-emerald-700"
            href="/discover/jobs-by-field"
          >
            Khám phá việc làm →
          </Link>
        </section>
        <section className="h-fit rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Hồ sơ của bạn</h2>
          <button
            onClick={() => open("profile")}
            className="w-full rounded-xl border p-4 text-left"
          >
            Cập nhật hồ sơ · {d.profileCompletion}%
          </button>
          <Link
            href="/candidate?tab=profile"
            className="mt-3 block rounded-xl border p-4"
          >
            {d.cvs} CV hiện có · Xem hồ sơ & CV
          </Link>
        </section>
      </div>
    </div>
  );
}
