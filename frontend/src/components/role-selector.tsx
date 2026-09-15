"use client"

import { Building2, UserRound } from "lucide-react"

import { cn } from "@/lib/utils"

export type Role = "candidate" | "employer"

const OPTIONS: {
  value: Role
  label: string
  description: string
  icon: typeof UserRound
}[] = [
  {
    value: "candidate",
    label: "Ứng viên tìm việc",
    description: "Tìm kiếm việc làm mơ ước",
    icon: UserRound,
  },
  {
    value: "employer",
    label: "Nhà tuyển dụng",
    description: "Đăng tin & tìm nhân tài",
    icon: Building2,
  },
]

export function RoleSelector({
  value,
  onChange,
}: {
  value: Role
  onChange: (role: Role) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Chọn vai trò"
      className="grid grid-cols-2 gap-3"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.value
        const Icon = option.icon
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "group flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected
                ? "border-primary bg-accent shadow-sm"
                : "border-border bg-card hover:border-primary/40 hover:bg-accent/40"
            )}
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-lg transition-colors [&_svg]:size-5",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:text-foreground"
              )}
            >
              <Icon />
            </span>
            <span className="flex flex-col gap-0.5">
              <span
                className={cn(
                  "text-sm font-semibold",
                  selected ? "text-foreground" : "text-foreground"
                )}
              >
                {option.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
