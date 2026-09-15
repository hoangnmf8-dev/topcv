"use client"

import Image from "next/image"
import { ArrowUpRight, BriefcaseBusiness, CalendarClock, Heart, MapPin, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Job } from "@/lib/jobs"

type JobCardProps = {
  job: Job
  saved: boolean
  onSelect: () => void
  onToggleSave: () => void
}

export function JobCard({ job, saved, onSelect, onToggleSave }: JobCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      className="group relative flex cursor-pointer flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-emerald-950/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <Image
            src={job.logo || "/placeholder.svg"}
            alt={`Logo ${job.company}`}
            width={64}
            height={64}
            className="size-full object-contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2 pr-8">
            <h3 className="line-clamp-2 flex-1 text-[15px] font-semibold leading-6 text-slate-900 transition-colors group-hover:text-emerald-700">
              {job.title}
            </h3>
            {job.hot && (
              <Badge className="shrink-0 border border-rose-200 bg-rose-50 text-[10px] font-bold text-rose-700 shadow-none">
                <Sparkles className="size-3" /> HOT
              </Badge>
            )}
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 line-clamp-1 text-sm text-slate-500">
            <BriefcaseBusiness className="size-3.5" />
            {job.company}
          </p>
        </div>

        {/* Save */}
        <button
          type="button"
          aria-label={saved ? "Bỏ lưu tin" : "Lưu tin"}
          aria-pressed={saved}
          onClick={(e) => {
            e.stopPropagation()
            onToggleSave()
          }}
          className="absolute right-4 top-4 grid size-9 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:scale-105 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 active:scale-95"
        >
          <Heart
            className={cn(
              "size-5 transition-colors",
              saved && "fill-primary text-primary"
            )}
          />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-emerald-50/80 px-3.5 py-3">
        <span className="text-xs font-medium text-emerald-700">Mức lương</span>
        <span className="text-sm font-bold text-emerald-700">
          {job.salary}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="gap-1.5 rounded-lg border-slate-200 bg-slate-50 px-2.5 py-1.5 font-normal text-slate-600">
          <MapPin className="size-3.5" />
          {job.location}
        </Badge>
        <Badge variant="outline" className="gap-1.5 rounded-lg border-slate-200 bg-slate-50 px-2.5 py-1.5 font-normal text-slate-600">
          <BriefcaseBusiness className="size-3.5" />
          {job.jobType}
        </Badge>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarClock className="size-3.5 text-amber-600" />
          Hạn nộp: {job.deadline}
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 opacity-0 transition-opacity group-hover:opacity-100">Xem chi tiết <ArrowUpRight className="size-3.5" /></span>
      </div>
    </div>
  )
}
