"use client"

import { SlidersHorizontal, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"

const EXPERIENCE_OPTIONS = [
  { value: "0", label: "Chưa có kinh nghiệm" },
  { value: "1", label: "Dưới 1 năm" },
  { value: "2", label: "1 - 2 năm" },
  { value: "3", label: "3 - 4 năm" },
  { value: "5", label: "Trên 5 năm" },
]

const JOB_TYPE_OPTIONS = ["Full-time", "Part-time"]

type FilterSidebarProps = {
  salary: number[]
  onSalaryChange: (value: number[]) => void
  experience: string[]
  onToggleExperience: (value: string) => void
  jobTypes: string[]
  onToggleJobType: (value: string) => void
  onReset: () => void
}

export function FilterSidebar({
  salary,
  onSalaryChange,
  experience,
  onToggleExperience,
  jobTypes,
  onToggleJobType,
  onReset,
}: FilterSidebarProps) {
  return (
    <aside className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Lọc nâng cao</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground"
        >
          <RotateCcw className="size-3.5" data-icon="inline-start" />
          Đặt lại
        </Button>
      </div>
      <Separator />

      {/* Salary */}
      <div className="px-4 py-5">
        <h3 className="mb-4 text-sm font-semibold">Mức lương (triệu VNĐ)</h3>
        <Slider
          value={salary}
          onValueChange={(v) => onSalaryChange(v as number[])}
          min={0}
          max={60}
          step={1}
          className="mb-3"
        />
        <div className="flex items-center justify-between text-sm">
          <span className="rounded-md bg-muted px-2 py-1 font-medium">
            {salary[0]} triệu
          </span>
          <span className="text-muted-foreground">đến</span>
          <span className="rounded-md bg-muted px-2 py-1 font-medium">
            {salary[1]}
            {salary[1] >= 60 ? "+ triệu" : " triệu"}
          </span>
        </div>
      </div>
      <Separator />

      {/* Experience */}
      <div className="px-4 py-5">
        <h3 className="mb-3 text-sm font-semibold">Kinh nghiệm</h3>
        <div className="flex flex-col gap-3">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <Label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2.5 font-normal"
            >
              <Checkbox
                checked={experience.includes(opt.value)}
                onCheckedChange={() => onToggleExperience(opt.value)}
              />
              <span className="text-sm">{opt.label}</span>
            </Label>
          ))}
        </div>
      </div>
      <Separator />

      {/* Job type */}
      <div className="px-4 py-5">
        <h3 className="mb-3 text-sm font-semibold">Hình thức làm việc</h3>
        <div className="flex flex-col gap-3">
          {JOB_TYPE_OPTIONS.map((opt) => (
            <Label
              key={opt}
              className="flex cursor-pointer items-center gap-2.5 font-normal"
            >
              <Checkbox
                checked={jobTypes.includes(opt)}
                onCheckedChange={() => onToggleJobType(opt)}
              />
              <span className="text-sm">{opt}</span>
            </Label>
          ))}
        </div>
      </div>
    </aside>
  )
}
