"use client";
import { useState } from "react";
import Link from "next/link";
import { Heart, Search } from "lucide-react";
import { jobs } from "@/lib/jobs";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
export function CandidateSavedJobs() {
  const { saved, toggle } = useSavedJobs();
  const [query, setQuery] = useState("");
  const savedJobs = jobs.filter(job => saved.has(job.id));
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  const filtered = savedJobs.filter(job => normalize(job.title + " " + job.company + " " + job.location).includes(normalize(query.trim())));
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-xl font-bold">Việc làm đã lưu</h2>
    <div className="my-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500" aria-live="polite">{filtered.length} / {savedJobs.length} việc làm</p>
      <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2"><Search className="size-4 shrink-0 text-slate-500"/><input aria-label="Tìm trong việc làm đã lưu" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tên việc, công ty, địa điểm" className="min-w-0 flex-1 bg-transparent text-sm outline-none"/></label>
    </div>
    {filtered.length ? <ul className="divide-y divide-slate-100">{filtered.map(job => <li key={job.id} className="flex items-center gap-3 py-5">
      <Link href={"/jobs/" + job.id} className="min-w-0 flex-1 rounded-lg focus-visible:outline-emerald-600"><h3 className="font-semibold text-slate-900 hover:text-emerald-700">{job.title}</h3><p className="mt-1 text-sm text-slate-500">{job.company}</p><p className="mt-2 text-sm text-emerald-700">{job.salary} · {job.location}</p></Link>
      <button type="button" onClick={() => toggle(job.id)} aria-label={"Bỏ lưu " + job.title} className="shrink-0 rounded-xl border border-slate-200 p-3 text-emerald-700 hover:bg-emerald-50"><Heart className="size-5" fill="currentColor"/></button>
    </li>)}</ul> : <div className="py-10 text-center"><Heart className="mx-auto mb-3 size-9 text-emerald-600"/><p>{savedJobs.length ? "Không có việc làm khớp từ khóa." : "Bạn chưa lưu việc làm nào."}</p>{savedJobs.length ? <button onClick={() => setQuery("")} className="mt-4 font-semibold text-emerald-700">Xóa tìm kiếm</button> : <Link href="/#jobs" className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white">Khám phá việc làm</Link>}</div>}
  </section>;
}
