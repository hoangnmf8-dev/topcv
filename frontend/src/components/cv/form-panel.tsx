"use client"

import { useState } from "react"
import { ChevronDown, GraduationCap, Sparkles, Target, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildContext } from "@/lib/ai-client"
import type { CVData } from "@/lib/cv-data"
import { PersonalSection } from "./sections/personal-section"
import { ObjectiveSection } from "./sections/objective-section"
import { ExperienceSection } from "./sections/experience-section"
import { EducationSkillsSection } from "./sections/education-skills-section"

export function FormPanel({
  data,
  setData,
}: {
  data: CVData
  setData: React.Dispatch<React.SetStateAction<CVData>>
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    personal: true,
    objective: true,
    experience: false,
    education: false,
  })
  const toggle = (key: string) => setOpen((o) => ({ ...o, [key]: !o[key] }))

  const context = buildContext(data)

  return (
    <div className="scrollbar-slim h-full overflow-y-auto bg-background p-4 sm:p-5">
      <div className="mx-auto flex max-w-2xl flex-col gap-3">
        <AccordionItem
          id="personal"
          icon={<UserRound className="h-4 w-4" />}
          title="Thông tin cá nhân"
          subtitle="Ảnh, tên, liên hệ"
          open={open.personal}
          onToggle={() => toggle("personal")}
        >
          <PersonalSection
            value={data.personal}
            onChange={(personal) => setData((d) => ({ ...d, personal }))}
          />
        </AccordionItem>

        <AccordionItem
          id="objective"
          icon={<Target className="h-4 w-4" />}
          title="Mục tiêu nghề nghiệp"
          subtitle="Giới thiệu bản thân"
          badge="AI"
          open={open.objective}
          onToggle={() => toggle("objective")}
        >
          <ObjectiveSection
            value={data.objective}
            onChange={(objective) => setData((d) => ({ ...d, objective }))}
            context={context}
          />
        </AccordionItem>

        <AccordionItem
          id="experience"
          icon={<Sparkles className="h-4 w-4" />}
          title="Kinh nghiệm làm việc"
          subtitle={`${data.experiences.length} mục`}
          badge="AI"
          open={open.experience}
          onToggle={() => toggle("experience")}
        >
          <ExperienceSection
            value={data.experiences}
            onChange={(experiences) => setData((d) => ({ ...d, experiences }))}
            context={context}
          />
        </AccordionItem>

        <AccordionItem
          id="education"
          icon={<GraduationCap className="h-4 w-4" />}
          title="Học vấn & Kỹ năng"
          subtitle={`${data.educations.length} bằng cấp · ${data.skills.length} kỹ năng`}
          open={open.education}
          onToggle={() => toggle("education")}
        >
          <EducationSkillsSection
            educations={data.educations}
            skills={data.skills}
            onEducationsChange={(educations) => setData((d) => ({ ...d, educations }))}
            onSkillsChange={(skills) => setData((d) => ({ ...d, skills }))}
          />
        </AccordionItem>
      </div>
    </div>
  )
}

function AccordionItem({
  icon,
  title,
  subtitle,
  badge,
  open,
  onToggle,
  children,
}: {
  id: string
  icon: React.ReactNode
  title: string
  subtitle?: string
  badge?: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{title}</span>
            {badge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                <Sparkles className="h-2.5 w-2.5" />
                {badge}
              </span>
            )}
          </span>
          {subtitle && (
            <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open && <div className="border-t border-border px-4 py-4">{children}</div>}
    </section>
  )
}
