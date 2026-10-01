"use client"

import { CvErrors } from "../validation-errors"
import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { TextArea } from "@/components/cv/field"
import { CV_TEXT_LIMIT } from "@/lib/content-limits"
import aiService from "@/services/ai.service"

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
  const [error, setError] = useState("");
  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await aiService.generateTextAI("objective", {currentText:value, profile:context});
      if(!response.success || typeof response.data!=="string")throw new Error(response.message || "AI chưa trả về nội dung hợp lệ");
      onChange(response.data);
    } catch(e) { setError(e instanceof Error ? e.message : "Không thể cải thiện nội dung"); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={loading || !value.trim()}
          onClick={generate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          Cải thiện văn phong với AI
        </button>
      </div>
      <TextArea
        value={value}
        maxLength={CV_TEXT_LIMIT}
        readOnly={loading}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="Nhập mục tiêu nghề nghiệp hoặc để Gemini AI gợi ý cho bạn..."
      />
      <p className="text-xs text-muted-foreground">{value.length}/{CV_TEXT_LIMIT} ký tự</p>
      <CvErrors path="data.objective" />
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
