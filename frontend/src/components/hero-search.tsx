"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowRight, BriefcaseBusiness, Layers3, MapPin, Search, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JOB_CATEGORIES, JOB_CATEGORY_BY_CODE } from "@/lib/job-categories"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const QUICK_TAGS = ["ReactJS", "Marketing", "Tester", "Java", "Kế toán", "Designer"]

const CATEGORY_LABELS: Record<string, string> = { all: "Tất cả danh mục nghề", ...JOB_CATEGORY_BY_CODE }

const LOCATION_LABELS: Record<string, string> = {
  all: "Tất cả địa điểm",
  hanoi: "Hà Nội",
  hcm: "Hồ Chí Minh",
  danang: "Đà Nẵng",
}

export function HeroSearch() {
  const router = useRouter()
  const [keyword, setKeyword] = useState("")
  const [category, setCategory] = useState("all")
  const [location, setLocation] = useState("all")

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set("q", keyword.trim())
    if (category !== "all") params.set("category", category)
    if (location !== "all") params.set("location", location)
    router.push(`/?${params.toString()}#jobs`)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-600">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div aria-hidden className="absolute -left-20 top-10 size-72 rounded-full bg-emerald-300/10 blur-3xl" />
      <div aria-hidden className="absolute -right-20 bottom-0 size-80 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_.92fr] lg:gap-12">
        <div className="text-center lg:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-emerald-50 backdrop-blur-sm">
            <Sparkles className="size-3.5" /> Hơn 10.000 cơ hội mới được cập nhật mỗi ngày
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white md:text-5xl md:leading-[1.15]">
            Công việc phù hợp đang chờ bạn
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-6 text-emerald-50/85 md:text-base lg:mx-0">
            Khám phá cơ hội từ doanh nghiệp đã xác thực, theo đúng chuyên môn, địa điểm và định hướng nghề nghiệp của bạn.
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-xl"><div className="absolute -inset-3 rounded-[2rem] bg-white/10 blur-xl"/><div className="relative overflow-hidden rounded-[1.75rem] border border-white/25 bg-white shadow-2xl shadow-emerald-950/25"><Image src="/images/topcv-job-hero.png" alt="Ứng viên khám phá cơ hội nghề nghiệp trên TopCV" width={1536} height={1024} priority className="h-auto w-full"/></div><span className="absolute -bottom-4 left-5 rounded-2xl border border-white/30 bg-white/95 px-4 py-3 text-xs font-bold text-emerald-800 shadow-xl backdrop-blur">10.000+ cơ hội mỗi ngày</span></div>
        </div>

        <form onSubmit={submit} className="mx-auto mt-8 max-w-6xl rounded-2xl border border-white/25 bg-white p-2.5 shadow-2xl shadow-emerald-950/25 md:rounded-3xl md:p-3">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_260px_220px_auto] md:items-center">
            <label className="flex h-13 items-center gap-3 rounded-xl border border-transparent bg-slate-50 px-4 transition focus-within:border-emerald-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50">
              <Search className="size-5 shrink-0 text-emerald-600" />
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Chức danh, vị trí hoặc từ khóa"
                className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>
            <div className="flex h-13 min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-2">
              <Layers3 className="ml-2 size-5 shrink-0 text-emerald-600" />
              <Select modal={false} value={category} onValueChange={(value) => value && setCategory(value)}>
                <SelectTrigger aria-label="Danh mục nghề" className="h-11 min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:block [&_[data-slot=select-value]]:truncate">
                  <SelectValue>{CATEGORY_LABELS[category]}</SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} align="start" className="min-w-64 max-w-[calc(100vw-2rem)] p-1">
                  <SelectItem value="all">Tất cả danh mục nghề</SelectItem>
                  {JOB_CATEGORIES.map((item) => <SelectItem key={item.code} value={item.code}>{item.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex h-13 min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-2">
              <MapPin className="ml-2 size-5 shrink-0 text-emerald-600" />
              <Select modal={false} value={location} onValueChange={(value) => value && setLocation(value)}>
                <SelectTrigger aria-label={undefined} className="h-11 min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:block [&_[data-slot=select-value]]:truncate">
                  <SelectValue>{LOCATION_LABELS[location]}</SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} align="start" className="min-w-64 max-w-[calc(100vw-2rem)] p-1">
                  <SelectItem value="all">Tất cả địa điểm</SelectItem>
                  <SelectItem value="hanoi">Hà Nội</SelectItem>
                  <SelectItem value="hcm">Hồ Chí Minh</SelectItem>
                  <SelectItem value="danang">Đà Nẵng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button size="lg" type="submit" className="h-13 gap-2 rounded-xl bg-emerald-600 px-7 text-sm font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl">
              <Search className="size-4" />
              Tìm kiếm
            </Button>
          </div>
        </form>

        <div className="mx-auto mt-5 flex max-w-6xl flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-sm text-emerald-50/80">Tìm kiếm phổ biến:</span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setKeyword(tag)}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-white hover:text-emerald-800"
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 text-xs text-emerald-50/85 sm:grid-cols-3">
          <span className="flex items-center justify-center gap-2"><ShieldCheck className="size-4 text-emerald-300" /> Doanh nghiệp đã xác thực</span>
          <span className="flex items-center justify-center gap-2"><BriefcaseBusiness className="size-4 text-emerald-300" /> Tin tuyển dụng minh bạch</span>
          <span className="flex items-center justify-center gap-2"><ArrowRight className="size-4 text-emerald-300" /> Ứng tuyển nhanh với CV đã lưu</span>
        </div>
      </div>
    </section>
  )
}
