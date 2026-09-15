"use client"
import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowUpDown, SearchX, Sparkles } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { JobCard } from "@/components/job-card"
import { Skeleton } from "@/components/ui/skeleton"
import { jobs, type Job } from "@/lib/jobs"

const categoryMap: Record<string, string> = { it: "Công nghệ thông tin", sales: "Kinh doanh", marketing: "Marketing", accounting: "Kế toán", design: "Thiết kế" }
const locationMap: Record<string, string> = { hanoi: "Hà Nội", hcm: "Hồ Chí Minh", danang: "Đà Nẵng" }

function JobCardSkeleton() {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex gap-4"><Skeleton className="size-16 shrink-0"/><div className="flex-1 space-y-2"><Skeleton className="h-5 w-4/5"/><Skeleton className="h-4 w-2/5"/></div></div><Skeleton className="mt-4 h-12 w-full"/><div className="mt-3 flex gap-2"><Skeleton className="h-7 w-24"/><Skeleton className="h-7 w-28"/></div><Skeleton className="mt-4 h-px w-full"/><Skeleton className="mt-4 h-4 w-1/2"/></div>
}

export function JobBoard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sort, setSort] = React.useState("newest")
  const [saved, setSaved] = React.useState<Set<string>>(new Set())
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    const timer = window.setTimeout(() => setLoading(false), 350)
    return () => window.clearTimeout(timer)
  }, [searchParams, sort])

  const filtered = React.useMemo(() => {
    const keyword = searchParams.get("q")?.toLowerCase() ?? ""
    const category = categoryMap[searchParams.get("category") ?? ""]
    const location = locationMap[searchParams.get("location") ?? ""]
    return jobs.filter((job) => {
      const matchesKeyword = !keyword || `${job.title} ${job.company} ${job.tags.join(" ")}`.toLowerCase().includes(keyword)
      const matchesCategory = !category || job.category.includes(category)
      const matchesLocation = !location || job.location === location
      return matchesKeyword && matchesCategory && matchesLocation
    })
  }, [searchParams])

  const sorted = [...filtered].sort((a,b) => sort === "salary" ? b.salaryMin - a.salaryMin : sort === "hot" ? Number(b.hot) - Number(a.hot) : 0)
  const toggle = (id:string) => setSaved(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  const open = (job:Job) => router.push(`/jobs/${job.id}`)
  const reset = () => router.push("/#jobs")

  return <section id="jobs" className="bg-slate-50/70 py-10 sm:py-14"><div className="mx-auto max-w-7xl px-4 sm:px-6">
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700"><Sparkles className="size-3.5"/>Cơ hội dành cho bạn</div><h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Việc làm nổi bật</h2><p className="mt-2 text-sm text-slate-500">Tin tuyển dụng mới từ các doanh nghiệp uy tín, cập nhật liên tục.</p></div><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"><ArrowUpDown className="ml-2 size-4 text-slate-400"/><Select value={sort} onValueChange={(value)=>value&&setSort(value)}><SelectTrigger className="w-40 border-0 shadow-none"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="newest">Mới nhất</SelectItem><SelectItem value="salary">Lương cao nhất</SelectItem><SelectItem value="hot">Tin HOT</SelectItem></SelectContent></Select></div></div>
    <div><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500"><b className="font-semibold text-slate-900">{sorted.length}</b> việc làm phù hợp</p><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Cập nhật hôm nay</span></div>
      {loading ? <div className="grid gap-4 md:grid-cols-2">{Array.from({length:6},(_,index)=><JobCardSkeleton key={index}/>)}</div> : sorted.length > 0 ? <div className="grid gap-4 md:grid-cols-2">{sorted.map(job=><JobCard key={job.id} job={job} saved={saved.has(job.id)} onSelect={()=>open(job)} onToggleSave={()=>toggle(job.id)}/>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center sm:px-6 sm:py-16"><span className="mx-auto grid size-14 place-items-center rounded-full bg-slate-100 text-slate-500"><SearchX className="size-6"/></span><h3 className="mt-4 font-semibold text-slate-900">Chưa tìm thấy việc làm phù hợp</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Hãy thử thay đổi từ khóa hoặc điều kiện tìm kiếm để khám phá thêm cơ hội.</p><button onClick={reset} className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">Xóa tìm kiếm</button></div>}
    </div>
  </div></section>
}
