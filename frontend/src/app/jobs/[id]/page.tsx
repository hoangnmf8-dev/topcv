"use client"

import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useState } from "react"
import { useSavedJobs } from "@/hooks/use-saved-jobs"
import { ArrowLeft, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, Heart, MapPin, Send, Share2, ShieldCheck, Sparkles, Users } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import jobPostService from "@/services/job-post.service"
import { toJobCard } from "@/lib/utils"
import { QuickApplyDialog } from "@/components/quick-apply-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function JobDetailPage() {
  const params = useParams<{ id: string }>()
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["job-post", "detail", params.id],
    queryFn: ({ signal }) => jobPostService.getJobPost(params.id, signal),
    retry: (count, error) => !(isAxiosError(error) && error.response?.status === 404) && count < 2,
  })
  const [applyOpen,setApplyOpen]=useState(false)
  const { saved: savedIds, toggle } = useSavedJobs()
  if (isPending || isError || !data) {
    const missing = isAxiosError(error) && error.response?.status === 404
    return <main className="route-home min-h-screen bg-slate-50 text-slate-800"><SiteHeader /><section className="mx-auto max-w-7xl px-4 py-16 text-center" aria-busy={isPending}>
      <h1 className="text-xl font-semibold" role={isError ? "alert" : "status"}>{isPending ? "Đang tải thông tin việc làm…" : missing ? "Tin tuyển dụng không tồn tại hoặc không còn được công khai" : "Không thể tải thông tin việc làm"}</h1>
      {isError && !missing && <Button className="mt-5" disabled={isFetching} onClick={() => refetch()}>Thử lại</Button>}
      <Link href="/#jobs" className="mt-6 block text-emerald-700">Quay lại danh sách việc làm</Link>
    </section><SiteFooter /></main>
  }
  const job = toJobCard(data)
  const saved = savedIds.has(job.id)
  return <><main className="route-home min-h-screen bg-slate-50 text-slate-800"><SiteHeader />
    <section className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-4 text-sm text-slate-500 sm:px-6"><Link href="/" className="flex items-center gap-1 font-medium transition hover:text-emerald-700"><ArrowLeft className="size-4"/>Danh sách việc làm</Link><ChevronRight className="size-4" /><span>{job.category}</span><ChevronRight className="size-4" /><span className="truncate text-slate-700">{job.title}</span></div></section>
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:items-start">
      <div className="space-y-6 lg:col-span-8"><section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"><div className="h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400"/><div className="p-6 sm:p-7"><div className="flex flex-col gap-5 sm:flex-row"><div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"><Image src={job.logo} alt={job.company} width={72} height={72} className="object-contain" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-none"><ShieldCheck className="size-3"/>Đang tuyển</Badge>{job.hot&&<Badge className="border border-rose-200 bg-rose-50 text-rose-700 shadow-none"><Sparkles className="size-3"/>Tin nổi bật</Badge>}</div><h1 className="mt-3 text-2xl font-semibold leading-8 tracking-tight text-slate-900 sm:text-3xl">{job.title}</h1><p className="mt-2 text-sm font-medium text-slate-500">{job.company}</p><p className="mt-4 text-xl font-bold text-emerald-700">{job.salary}</p></div></div><div className="mt-7 grid gap-3 border-y border-slate-100 py-5 sm:grid-cols-3"><Info icon={<MapPin />} title="Địa điểm" value={job.location} /><Info icon={<BriefcaseBusiness />} title="Kinh nghiệm" value={job.experience === "0" ? "Không yêu cầu" : `${job.experience} năm`} /><Info icon={<CalendarDays />} title="Hạn ứng tuyển" value={job.deadline} /></div><div className="mt-5 flex flex-col gap-3 sm:flex-row"><Button size="lg" onClick={()=>setApplyOpen(true)} className="h-12 flex-1 rounded-xl bg-emerald-600 font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700"><Send className="size-4" />Ứng tuyển ngay</Button><Button size="lg" variant="outline" onClick={()=>toggle(job.id)} aria-label={saved?"Bỏ lưu việc làm":"Lưu việc làm"} className={`h-12 rounded-xl border-emerald-200 px-5 font-semibold text-emerald-700 hover:bg-emerald-50 ${saved?"bg-emerald-50":""}`}><Heart className="size-5" fill={saved?"currentColor":"none"}/>{saved?"Đã lưu":"Lưu tin"}</Button><Button size="icon-lg" variant="outline" aria-label="Chia sẻ việc làm" className="h-12 rounded-xl border-slate-200"><Share2 className="size-4"/></Button></div>{saved&&<p className="mt-3 text-right text-xs font-semibold text-emerald-700">Đã lưu vào danh sách việc làm yêu thích</p>}</div></section>
      <DetailSection title="Tổng quan"><div className="mb-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Hình thức làm việc</p><p className="mt-1 font-semibold text-slate-900">{job.jobType}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Cập nhật gần nhất</p><p className="mt-1 font-semibold text-slate-900">{new Date(job.updatedAt).toLocaleDateString("vi-VN")}</p></div></div><p className="mb-3 text-sm font-semibold text-slate-900">Chuyên môn</p><div className="flex flex-wrap gap-2">{job.tags.map(t => <Badge key={t} variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">{t}</Badge>)}</div></DetailSection>
      <DetailSection title="Mô tả công việc"><Bullets items={job.description} /></DetailSection><DetailSection title="Yêu cầu ứng viên"><Bullets items={job.requirements} /></DetailSection><DetailSection title="Quyền lợi"><Bullets items={job.benefits} /></DetailSection></div>
      <aside className="space-y-5 lg:col-span-4"><div className="sticky top-24 space-y-5"><section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Nhà tuyển dụng</p><div className="mt-4 flex items-center gap-3"><div className="grid size-16 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5"><Image src={job.logo} alt="" width={56} height={56} /></div><div><h2 className="font-semibold text-slate-900">{job.company}</h2><p className="mt-1 text-xs text-slate-500">Thông tin doanh nghiệp</p></div></div><div className="mt-5 space-y-4 border-t border-slate-100 pt-5 text-sm"><p className="flex gap-3 text-slate-600"><Users className="size-5 shrink-0 text-emerald-600" />{job.company_info.size}</p><p className="flex gap-3 text-slate-600"><CircleDollarSign className="size-5 shrink-0 text-emerald-600" />{job.company_info.field}</p><p className="flex gap-3 text-slate-600"><MapPin className="size-5 shrink-0 text-emerald-600" />{job.company_info.address}</p></div></section></div></aside>
    </div><SiteFooter /></main><QuickApplyDialog job={job} open={applyOpen} onOpenChange={setApplyOpen}/></>
}
function Info({icon,title,value}:{icon:React.ReactNode;title:string;value:string}) { return <div className="flex gap-3 rounded-xl bg-slate-50 p-3.5"><span className="text-emerald-600 [&>svg]:size-5">{icon}</span><div><p className="text-xs text-slate-500">{title}</p><p className="mt-1 text-sm font-semibold text-slate-900">{value}</p></div></div> }
function DetailSection({title,children}:{title:string;children:React.ReactNode}) { return <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7"><div className="flex items-center gap-3"><span className="h-7 w-1 rounded-full bg-emerald-500"/><h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2></div><div className="mt-5 text-sm leading-7 text-slate-700">{children}</div></section> }
function Bullets({items}:{items:string[]}) { return <ul className="space-y-3">{items.map(item => <li key={item} className="flex gap-3 rounded-xl px-2 py-1 transition hover:bg-slate-50"><CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" /><span className="whitespace-pre-line">{item}</span></li>)}</ul> }
