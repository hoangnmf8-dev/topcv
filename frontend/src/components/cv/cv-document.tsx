import type { CVData, TemplateId, ThemeId } from "@/lib/cv-layout"
import { getTheme } from "@/lib/cv-layout"
import { Globe, Link2, Mail, MapPin, Phone, User } from "lucide-react"
import { AtsTemplate, CreativeTemplate, ExecutiveTemplate, GraduateTemplate, SalesTemplate, TechTemplate } from "@/components/cv/cv-template-variants"

interface Props {
  data: CVData
  template: TemplateId
  theme: ThemeId
}

function Avatar({ src, ring }: { src: string; ring: string }) {
  if (src) {
    return (
      <img
        src={src || "/placeholder.svg"}
        alt="Ảnh đại diện"
        className="h-full w-full object-cover"
      />
    )
  }
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: ring }}
      aria-hidden="true"
    >
      <User className="h-1/2 w-1/2" style={{ color: "#ffffff" }} />
    </div>
  )
}

/* ---------------- Modern (2 columns w/ colored sidebar) ---------------- */
function ModernTemplate({ data, accent, soft, ink }: RenderProps) {
  const { personal } = data
  return (
    <div className="flex h-full min-h-full font-sans text-[11px] leading-relaxed text-neutral-700">
      {/* Sidebar */}
      <aside className="w-[34%] shrink-0 p-6 text-white" style={{ background: accent }}>
        <div className="mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full ring-4 ring-white/30">
          <Avatar src={personal.avatar} ring={ink} />
        </div>

        <SidebarHeading>Liên hệ</SidebarHeading>
        <ul className="mb-5 flex flex-col gap-2 text-[10.5px]">
          <ContactRow icon={<Phone className="h-3 w-3" />} value={personal.phone} light />
          <ContactRow icon={<Mail className="h-3 w-3" />} value={personal.email} light />
          <ContactRow icon={<MapPin className="h-3 w-3" />} value={personal.address} light />
          <ContactRow icon={<Link2 className="h-3 w-3" />} value={personal.github} light />
          <ContactRow icon={<Globe className="h-3 w-3" />} value={personal.linkedin} light />
        </ul>

        <SidebarHeading>Kỹ năng</SidebarHeading>
        <ul className="flex flex-col gap-2.5">
          {data.skills.map((s) => (
            <li key={s.id}>
              <div className="mb-1 flex items-center justify-between text-[10.5px]">
                <span className="font-medium">{s.name}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${(s.level / 5) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main */}
      <main className="flex-1 p-7">
        <header className="mb-5">
          <h1 className="text-[26px] font-bold leading-tight text-neutral-900">
            {personal.fullName}
          </h1>
          <p className="mt-0.5 text-[13px] font-medium" style={{ color: accent }}>
            {personal.title}
          </p>
        </header>

        <MainSection title="Mục tiêu nghề nghiệp" accent={accent}>
          <p className="text-justify">{data.objective}</p>
        </MainSection>

        <MainSection title="Kinh nghiệm làm việc" accent={accent}>
          <div className="flex flex-col gap-4">
            {data.experiences.map((exp) => (
              <ExperienceBlock key={exp.id} exp={exp} accent={accent} soft={soft} />
            ))}
          </div>
        </MainSection>

        <MainSection title="Học vấn" accent={accent}>
          <div className="flex flex-col gap-2.5">
            {data.educations.map((edu) => (
              <div key={edu.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="font-semibold text-neutral-900">{edu.school}</h4>
                  <span className="shrink-0 text-[10px] text-neutral-500">{edu.timeline}</span>
                </div>
                <p className="text-[10.5px]">{edu.degree}</p>
              </div>
            ))}
          </div>
        </MainSection>
      </main>
    </div>
  )
}

/* ---------------- Classic (serif, single column) ---------------- */
function ClassicTemplate({ data, accent }: RenderProps) {
  const { personal } = data
  return (
    <div className="h-full min-h-full bg-white p-10 font-serif text-[11px] leading-relaxed text-neutral-800">
      <header className="mb-5 border-b-2 pb-4 text-center" style={{ borderColor: accent }}>
        <h1 className="text-[28px] font-bold tracking-wide text-neutral-900">
          {personal.fullName}
        </h1>
        <p className="mt-1 text-[13px] uppercase tracking-[0.2em]" style={{ color: accent }}>
          {personal.title}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-neutral-600">
          <span>{personal.phone}</span>
          <span>·</span>
          <span>{personal.email}</span>
          <span>·</span>
          <span>{personal.address}</span>
        </div>
        <div className="mt-1 flex flex-wrap justify-center gap-x-4 text-[10px] text-neutral-600">
          <span>{personal.github}</span>
          <span>{personal.linkedin}</span>
        </div>
      </header>

      <ClassicSection title="Mục tiêu nghề nghiệp" accent={accent}>
        <p className="text-justify italic">{data.objective}</p>
      </ClassicSection>

      <ClassicSection title="Kinh nghiệm làm việc" accent={accent}>
        <div className="flex flex-col gap-4">
          {data.experiences.map((exp) => (
            <div key={exp.id}>
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="text-[12px] font-bold text-neutral-900">{exp.role}</h4>
                <span className="shrink-0 text-[10px] text-neutral-500">{exp.timeline}</span>
              </div>
              <p className="mb-1 text-[11px] font-semibold" style={{ color: accent }}>
                {exp.company}
              </p>
              <ul className="ml-4 list-disc space-y-0.5 text-justify">
                {exp.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ClassicSection>

      <div className="grid grid-cols-2 gap-6">
        <ClassicSection title="Học vấn" accent={accent}>
          <div className="flex flex-col gap-2">
            {data.educations.map((edu) => (
              <div key={edu.id}>
                <h4 className="font-bold text-neutral-900">{edu.school}</h4>
                <p className="text-[10.5px]">{edu.degree}</p>
                <p className="text-[10px] text-neutral-500">{edu.timeline}</p>
              </div>
            ))}
          </div>
        </ClassicSection>

        <ClassicSection title="Kỹ năng" accent={accent}>
          <ul className="flex flex-col gap-1.5">
            {data.skills.map((s) => (
              <li key={s.id} className="flex items-center justify-between">
                <span>{s.name}</span>
                <StarLevel level={s.level} accent={accent} />
              </li>
            ))}
          </ul>
        </ClassicSection>
      </div>
    </div>
  )
}

/* ---------------- Minimal (single column, airy) ---------------- */
function MinimalTemplate({ data, accent }: RenderProps) {
  const { personal } = data
  return (
    <div className="h-full min-h-full bg-white p-11 font-sans text-[11px] leading-relaxed text-neutral-600">
      <header className="mb-8">
        <h1 className="text-[30px] font-semibold tracking-tight text-neutral-900">
          {personal.fullName}
        </h1>
        <p className="mt-1 text-[13px] text-neutral-500">{personal.title}</p>
        <div className="mt-3 h-0.5 w-12" style={{ background: accent }} />
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-neutral-500">
          <span>{personal.phone}</span>
          <span>{personal.email}</span>
          <span>{personal.address}</span>
          <span>{personal.github}</span>
          <span>{personal.linkedin}</span>
        </div>
      </header>

      <MinimalSection title="Mục tiêu">
        <p className="text-neutral-700">{data.objective}</p>
      </MinimalSection>

      <MinimalSection title="Kinh nghiệm">
        <div className="flex flex-col gap-5">
          {data.experiences.map((exp) => (
            <div key={exp.id} className="grid grid-cols-[85px_1fr] gap-4">
              <span className="pt-0.5 text-[10px] text-neutral-400">{exp.timeline}</span>
              <div>
                <h4 className="text-[12px] font-semibold text-neutral-900">{exp.role}</h4>
                <p className="mb-1.5 text-[10.5px] text-neutral-500">{exp.company}</p>
                <ul className="space-y-1">
                  {exp.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: accent }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </MinimalSection>

      <MinimalSection title="Học vấn">
        <div className="flex flex-col gap-3">
          {data.educations.map((edu) => (
            <div key={edu.id} className="grid grid-cols-[85px_1fr] gap-4">
              <span className="pt-0.5 text-[10px] text-neutral-400">{edu.timeline}</span>
              <div>
                <h4 className="text-[12px] font-semibold text-neutral-900">{edu.school}</h4>
                <p className="text-[10.5px] text-neutral-500">{edu.degree}</p>
              </div>
            </div>
          ))}
        </div>
      </MinimalSection>

      <MinimalSection title="Kỹ năng">
        <div className="flex flex-wrap gap-2">
          {data.skills.map((s) => (
            <span
              key={s.id}
              className="rounded-full px-3 py-1 text-[10px] font-medium"
              style={{ background: `${accent}14`, color: accent }}
            >
              {s.name}
            </span>
          ))}
        </div>
      </MinimalSection>
    </div>
  )
}

/* ---------------- Shared sub-components ---------------- */
interface RenderProps {
  data: CVData
  accent: string
  soft: string
  ink: string
}

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2.5 border-b border-white/30 pb-1 text-[11px] font-semibold uppercase tracking-wider">
      {children}
    </h3>
  )
}

function ContactRow({
  icon,
  value,
}: {
  icon: React.ReactNode
  value: string
  light?: boolean
}) {
  if (!value) return null
  return (
    <li className="flex items-center gap-2">
      <span className="opacity-90">{icon}</span>
      <span className="break-all">{value}</span>
    </li>
  )
}

function MainSection({
  title,
  accent,
  children,
}: {
  title: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-5">
      <h3
        className="mb-2 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-neutral-900"
      >
        <span className="inline-block h-3 w-1 rounded-full" style={{ background: accent }} />
        {title}
      </h3>
      {children}
    </section>
  )
}

function ExperienceBlock({
  exp,
  accent,
}: {
  exp: CVData["experiences"][number]
  accent: string
  soft: string
}) {
  return (
    <div className="relative border-l-2 pl-3.5" style={{ borderColor: `${accent}40` }}>
      <span
        className="absolute -left-[5px] top-1 h-2 w-2 rounded-full"
        style={{ background: accent }}
      />
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-[12px] font-semibold text-neutral-900">{exp.role}</h4>
        <span className="shrink-0 text-[10px] text-neutral-500">{exp.timeline}</span>
      </div>
      <p className="mb-1 text-[11px] font-medium" style={{ color: accent }}>
        {exp.company}
      </p>
      <ul className="space-y-0.5">
        {exp.bullets.map((b, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ClassicSection({
  title,
  accent,
  children,
}: {
  title: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-5">
      <h3
        className="mb-2 text-[13px] font-bold uppercase tracking-[0.15em]"
        style={{ color: accent }}
      >
        {title}
      </h3>
      {children}
    </section>
  )
}

function MinimalSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-7">
      <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
        {title}
      </h3>
      {children}
    </section>
  )
}

function StarLevel({ level, accent }: { level: number; accent: string }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: i < level ? accent : "#d4d4d4" }}
        />
      ))}
    </span>
  )
}

export function CVDocument({ data, template, theme }: Props) {
  const prescribedTheme:Partial<Record<TemplateId,ThemeId>>={executive:"slate",tech:"navy",creative:"purple",sales:"emerald",graduate:"navy",ats:"slate"}
  const t = getTheme(prescribedTheme[template]??theme)
  const render = { data, accent: t.accent, soft: t.soft, ink: t.ink }
  if (template === "executive") return <ExecutiveTemplate {...render}/>
  if (template === "tech") return <TechTemplate {...render}/>
  if (template === "creative") return <CreativeTemplate {...render}/>
  if (template === "sales") return <SalesTemplate {...render}/>
  if (template === "graduate") return <GraduateTemplate {...render}/>
  if (template === "ats") return <AtsTemplate {...render}/>
  if (template === "classic") return <ClassicTemplate {...render} />
  if (template === "minimal") return <MinimalTemplate {...render} />
  return <ModernTemplate {...render} />
}
