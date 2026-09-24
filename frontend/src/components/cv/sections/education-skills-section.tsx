"use client"

import { Plus, Star, Trash2 } from "lucide-react"
import { Field, TextInput } from "@/components/cv/field"
import { cn } from "@/lib/utils"
import { uid, type EducationItem, type SkillItem } from "@/lib/cv-layout"

export function EducationSkillsSection({
  educations,
  skills,
  onEducationsChange,
  onSkillsChange,
}: {
  educations: EducationItem[]
  skills: SkillItem[]
  onEducationsChange: (v: EducationItem[]) => void
  onSkillsChange: (v: SkillItem[]) => void
}) {
  /* Education */
  const updateEdu = (id: string, patch: Partial<EducationItem>) =>
    onEducationsChange(educations.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  const addEdu = () =>
    onEducationsChange([
      ...educations,
      { id: uid("edu"), school: "", degree: "", timeline: "" },
    ])
  const removeEdu = (id: string) =>
    onEducationsChange(educations.filter((e) => e.id !== id))

  /* Skills */
  const updateSkill = (id: string, patch: Partial<SkillItem>) =>
    onSkillsChange(skills.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  const addSkill = () =>
    onSkillsChange([...skills, { id: uid("sk"), name: "", level: 3 }])
  const removeSkill = (id: string) =>
    onSkillsChange(skills.filter((s) => s.id !== id))

  return (
    <div className="flex flex-col gap-5">
      {/* Education */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Học vấn
        </h4>
        {educations.map((edu) => (
          <div key={edu.id} className="rounded-xl border border-border bg-card p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Bằng cấp</span>
              <button
                type="button"
                onClick={() => removeEdu(edu.id)}
                aria-label="Xóa học vấn"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Trường" className="col-span-2">
                <TextInput value={edu.school} onChange={(e) => updateEdu(edu.id, { school: e.target.value })} />
              </Field>
              <Field label="Chuyên ngành / Bằng cấp">
                <TextInput value={edu.degree} onChange={(e) => updateEdu(edu.id, { degree: e.target.value })} />
              </Field>
              <Field label="Thời gian">
                <TextInput value={edu.timeline} onChange={(e) => updateEdu(edu.id, { timeline: e.target.value })} />
              </Field>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addEdu}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Thêm học vấn
        </button>
      </div>

      {/* Skills */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Kỹ năng
        </h4>
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 pl-3.5"
          >
            <input
              value={skill.name}
              onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
              placeholder="Tên kỹ năng"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
            />
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => updateSkill(skill.id, { level: i + 1 })}
                  aria-label={`Đặt mức ${i + 1} sao`}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "h-4 w-4 transition-colors",
                      i < skill.level
                        ? "fill-primary text-primary"
                        : "fill-transparent text-muted-foreground/40",
                    )}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => removeSkill(skill.id)}
              aria-label="Xóa kỹ năng"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSkill}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Thêm kỹ năng
        </button>
      </div>
    </div>
  )
}
