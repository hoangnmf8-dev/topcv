"use client"

import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { TextArea } from "@/components/cv/field"

export function ObjectiveSection({
  value,
  onChange,
  context,
}: {
  value: string
  onChange: (v: string) => void
  context: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const generate = async () => {setError("Tính năng AI hiện chưa khả dụng.");}

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Giới thiệu ngắn gọn về bản thân và mục tiêu.
        </p>
        <button
          type="button"
          onClick={generate}
          disabled title="Tính năng AI hiện chưa khả dụng"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          Gemini AI viết giúp
        </button>
      </div>
      <TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="Nhập mục tiêu nghề nghiệp hoặc để Gemini AI gợi ý cho bạn..."
      />
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
