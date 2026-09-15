"use client"

import * as React from "react"
import {
  UploadCloud,
  FileText,
  Sparkles,
  Send,
  X,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { savedCvOptions, type Job } from "@/lib/jobs"

type QuickApplyDialogProps = {
  job: Job | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SAMPLE_LETTER = (job: Job | null) =>
  `Kính gửi Bộ phận Tuyển dụng ${job?.company ?? ""},\n\n` +
  `Tôi rất quan tâm đến vị trí ${job?.title ?? ""} mà quý công ty đang tuyển dụng. ` +
  `Với kinh nghiệm và kỹ năng của mình, tôi tin rằng mình có thể đóng góp tích cực cho đội ngũ.\n\n` +
  `Tôi mong muốn có cơ hội được trao đổi thêm về cách tôi có thể mang lại giá trị cho công ty. ` +
  `Rất mong nhận được phản hồi từ quý công ty.\n\n` +
  `Trân trọng cảm ơn!`

export function QuickApplyDialog({
  job,
  open,
  onOpenChange,
}: QuickApplyDialogProps) {
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const [coverLetter, setCoverLetter] = React.useState("")
  const [generating, setGenerating] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    if (file.type !== "application/pdf") {
      toast.error("Chỉ chấp nhận file định dạng PDF.")
      return
    }
    if (file.size > 5 * 1024 * 1024) return toast.error("File CV không được vượt quá 5 MB.")
    setFileName(file.name)
  }

  function handleGenerate() {
    setGenerating(true)
    setTimeout(() => {
      setCoverLetter(SAMPLE_LETTER(job))
      setGenerating(false)
      toast.success("AI đã gợi ý thư giới thiệu cho bạn!")
    }, 1200)
  }

  function handleSubmit() {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      onOpenChange(false)
      toast.success(`Đã gửi hồ sơ ứng tuyển vị trí "${job?.title}"!`)
      // reset
      setFileName(null)
      setCoverLetter("")
    }, 1200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="p-5 pb-4">
          <DialogTitle>Ứng tuyển nhanh</DialogTitle>
          <DialogDescription>
            {job ? (
              <>
                Vị trí <span className="font-medium text-foreground">{job.title}</span> tại{" "}
                {job.company}
              </>
            ) : (
              "Hoàn tất thông tin để gửi hồ sơ ứng tuyển."
            )}
          </DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="p-5">
          <FieldGroup>
            {/* CV Select */}
            <Field>
              <FieldLabel htmlFor="cv-select">Chọn CV từ hệ thống</FieldLabel>
              <Select defaultValue={savedCvOptions[0].value}>
                <SelectTrigger id="cv-select" className="h-10 w-full">
                  <SelectValue placeholder="Chọn CV có sẵn" />
                </SelectTrigger>
                <SelectContent>
                  {savedCvOptions.map((cv) => (
                    <SelectItem key={cv.value} value={cv.value}>
                      {cv.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Upload dropzone */}
            <Field>
              <FieldLabel>Hoặc tải lên CV (PDF)</FieldLabel>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {fileName ? (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <FileText className="size-5 shrink-0 text-primary" />
                  <span className="flex-1 truncate text-sm font-medium">
                    {fileName}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Xóa file"
                  onClick={() => setFileName(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragging(false)
                    handleFiles(e.dataTransfer.files)
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center transition-colors hover:border-primary hover:bg-accent",
                    dragging && "border-primary bg-accent"
                  )}
                >
                  <UploadCloud className="size-6 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Kéo thả hoặc bấm để tải lên
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Hỗ trợ định dạng PDF, tối đa 5MB
                  </span>
                </button>
              )}
            </Field>

            {/* Cover letter */}
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="cover-letter">Thư giới thiệu</FieldLabel>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="gap-1.5"
                >
                  {generating ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  AI Gợi ý viết thư
                </Button>
              </div>
              <Textarea
                id="cover-letter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Viết một vài dòng giới thiệu bản thân tới nhà tuyển dụng..."
                className="min-h-32 resize-none"
              />
            </Field>
          </FieldGroup>
        </div>

        <Separator />
        <DialogFooter className="flex-row justify-end gap-2 p-5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Nộp hồ sơ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
