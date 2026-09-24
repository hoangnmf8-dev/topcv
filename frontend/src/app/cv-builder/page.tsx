"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Eye, Pencil } from "lucide-react"
import { toast } from "sonner"
import { ControlBar } from "@/components/cv/control-bar"
import { FormPanel } from "@/components/cv/form-panel"
import { PreviewPanel } from "@/components/cv/preview-panel"
import { CVDocument } from "@/components/cv/cv-document"
import { cn } from "@/lib/utils"
import {
  EMPTY_CV,
  type CVData,
  type TemplateId,
  type ThemeId,
} from "@/lib/cv-layout"

function CVBuilderPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<CVData>(EMPTY_CV)
  const [title, setTitle] = useState("CV của bạn")
  const [template, setTemplate] = useState<TemplateId>("modern")
  const [theme, setTheme] = useState<ThemeId>("emerald")
  const requestedTemplate=searchParams.get("template") as TemplateId|null
  const requestedTheme=searchParams.get("theme") as ThemeId|null
  useEffect(()=>{if(requestedTemplate)setTemplate(requestedTemplate);if(requestedTheme)setTheme(requestedTheme)},[requestedTemplate,requestedTheme])

  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState("")
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "default-saved">("idle")
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit")

  const handleOptimize = async () => {setAiError("Tính năng AI hiện chưa khả dụng.");}

  const persistCV = (isDefault: boolean) => {toast.info("Chức năng này hiện chưa khả dụng.");}

  const handleDownloadPDF = () => window.print()

  return (
    <div className="route-cv-builder flex h-dvh flex-col overflow-hidden">
      <ControlBar
        title={title}
        onTitleChange={setTitle}
        template={template}
        onTemplateChange={setTemplate}
        theme={theme}
        onThemeChange={setTheme}
        onOptimize={handleOptimize}
        onSave={() => persistCV(false)}
        onSaveAsDefault={() => persistCV(true)}
        onDownloadPDF={handleDownloadPDF}
        aiLoading={aiLoading}
        saveState={saveState}
      />

      {aiError && (
        <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-center text-xs font-medium text-destructive">
          {aiError}
        </div>
      )}

      {/* Mobile tab toggle */}
      <div className="flex shrink-0 items-center gap-1 border-b border-border bg-background p-1.5 lg:hidden">
        <TabButton active={mobileView === "edit"} onClick={() => setMobileView("edit")}>
          <Pencil className="h-4 w-4" />
          Chỉnh sửa
        </TabButton>
        <TabButton active={mobileView === "preview"} onClick={() => setMobileView("preview")}>
          <Eye className="h-4 w-4" />
          Xem trước
        </TabButton>
      </div>

      <main className="grid min-h-0 flex-1 lg:grid-cols-2">
        {/* Left: form */}
        <div
          className={cn(
            "min-h-0 border-r border-border",
            mobileView === "edit" ? "block" : "hidden lg:block",
          )}
        >
          <FormPanel data={data} setData={setData} />
        </div>

        {/* Right: preview */}
        <div
          className={cn(
            "min-h-0",
            mobileView === "preview" ? "block" : "hidden lg:block",
          )}
        >
          <PreviewPanel data={data} template={template} theme={theme} />
        </div>
      </main>

      {/*
        Keep a dedicated, unscaled A4 document for the browser print engine.
        Printing the on-screen preview directly is unreliable because it lives
        inside scroll/transform containers used by the zoom controls.
      */}
      <div id="cv-print-document" className="cv-print-document" aria-hidden="true">
        <CVDocument data={data} template={template} theme={theme} />
      </div>
    </div>
  )
}

export default function Page(){return <Suspense fallback={<div className="grid h-dvh place-items-center bg-slate-50 text-sm text-slate-500">Đang mở mẫu CV...</div>}><CVBuilderPage/></Suspense>}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  )
}
