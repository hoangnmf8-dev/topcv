"use client"

import { useState } from "react"
import { Loader2, Plus, Trash2, Wand2 } from "lucide-react"
import { Field, TextArea, TextInput } from "@/components/cv/field"
import { callAI } from "@/lib/ai-client"
import { uid, type ExperienceItem } from "@/lib/cv-data"

export function ExperienceSection({
  value,
  onChange,
  context,
}: {
  value: ExperienceItem[]
  onChange: (v: ExperienceItem[]) => void
  context: string
}) {
  const update = (id: string, patch: Partial<ExperienceItem>) =>
    onChange(value.map((it) => (it.id === id ? { ...it, ...patch } : it)))

  const add = () =>
    onChange([
      ...value,
      { id: uid("exp"), company: "", role: "", timeline: "", bullets: [""] },
    ])

  const remove = (id: string) => onChange(value.filter((it) => it.id !== id))

  return (
    <div className="flex flex-col gap-3">
      {value.map((exp, idx) => (
        <ExperienceCard
          key={exp.id}
          index={idx}
          exp={exp}
          context={context}
          onUpdate={(patch) => update(exp.id, patch)}
          onRemove={() => remove(exp.id)}
        />
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        Thêm kinh nghiệm
      </button>
    </div>
  )
}

function ExperienceCard({
  index,
  exp,
  context,
  onUpdate,
  onRemove,
}: {
  index: number
  exp: ExperienceItem
  context: string
  onUpdate: (patch: Partial<ExperienceItem>) => void
  onRemove: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const bulletsText = exp.bullets.join("\n")

  const setBullets = (text: string) =>
    onUpdate({ bullets: text.split("\n") })

  const improve = async () => {
    setLoading(true)
    setError("")
    try {
      const raw = await callAI("improve", {
        text: exp.bullets.filter(Boolean).map((b) => `- ${b}`).join("\n"),
        context: `${context} Công việc: ${exp.role} tại ${exp.company}.`,
      })
      const bullets = raw
        .split("\n")
        .map((l) => l.replace(/^[-*•]\s*/, "").trim())
        .filter(Boolean)
      onUpdate({ bullets: bullets.length ? bullets : exp.bullets })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Kinh nghiệm {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Xóa kinh nghiệm"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Công ty">
          <TextInput value={exp.company} onChange={(e) => onUpdate({ company: e.target.value })} />
        </Field>
        <Field label="Vị trí">
          <TextInput value={exp.role} onChange={(e) => onUpdate({ role: e.target.value })} />
        </Field>
        <Field label="Thời gian" className="col-span-2">
          <TextInput
            value={exp.timeline}
            onChange={(e) => onUpdate({ timeline: e.target.value })}
            placeholder="VD: 01/2022 - Hiện tại"
          />
        </Field>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            Mô tả công việc (mỗi ý một dòng)
          </label>
          <button
            type="button"
            onClick={improve}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wand2 className="h-3.5 w-3.5" />
            )}
            Cải thiện văn phong AI
          </button>
        </div>
        <TextArea
          value={bulletsText}
          onChange={(e) => setBullets(e.target.value)}
          rows={4}
          placeholder="- Mô tả thành tựu và trách nhiệm..."
        />
        {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      </div>
    </div>
  )
}
