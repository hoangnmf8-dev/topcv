import { cn } from "@/lib/utils"

export function TopCvLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className="flex size-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground shadow-sm"
        aria-hidden="true"
      >
        T
      </span>
      <span className="text-2xl font-extrabold tracking-tight text-foreground">
        Top<span className="text-primary">CV</span>
      </span>
    </div>
  )
}
