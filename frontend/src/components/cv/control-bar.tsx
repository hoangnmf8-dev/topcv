"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  LayoutTemplate,
  Loader2,
  Palette,
  Save,
  Star,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  TEMPLATES,
  THEMES,
  type TemplateId,
  type ThemeId,
} from "@/lib/cv-layout"

function useClickOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])
  return ref
}

export function ControlBar({
  title,
  onTitleChange,
  template,
  onTemplateChange,
  theme,
  onThemeChange,
  onOptimize,
  onSave,
  onSaveAsDefault,
  onDownloadPDF,
  aiLoading,
  saveState,
}: {
  title: string
  onTitleChange: (v: string) => void
  template: TemplateId
  onTemplateChange: (v: TemplateId) => void
  theme: ThemeId
  onThemeChange: (v: ThemeId) => void
  onOptimize: () => void
  onSave: () => void
  onSaveAsDefault: () => void
  onDownloadPDF: () => void
  aiLoading: boolean
  saveState: "idle" | "saving" | "saved" | "default-saved"
}) {
  const [tplOpen, setTplOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const tplRef = useClickOutside<HTMLDivElement>(() => setTplOpen(false))
  const themeRef = useClickOutside<HTMLDivElement>(() => setThemeOpen(false))

  const activeTpl = TEMPLATES.find((t) => t.id === template)!
  const activeTheme = THEMES.find((t) => t.id === theme)!

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-border bg-background/95 px-3 py-2.5 backdrop-blur sm:px-4">
      {/* Back */}
      <Link
        href="/candidate?tab=profile"
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Danh sách CV</span>
      </Link>

      <span className="h-6 w-px bg-border" />

      {/* Editable title */}
      <input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        aria-label="Tên CV"
        className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-semibold text-foreground outline-none transition-colors hover:border-border focus:border-primary focus:ring-3 focus:ring-primary/20 sm:max-w-xs"
      />

      {/* Template switcher */}
      <div className="relative" ref={tplRef}>
        <button
          type="button"
          onClick={() => { setTplOpen((o) => !o); setThemeOpen(false) }}
          aria-expanded={tplOpen}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
          <span className="hidden md:inline">{activeTpl.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        {tplOpen && (
          <div className="absolute left-0 top-full z-40 mt-1.5 w-56 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => { onTemplateChange(t.id); setTplOpen(false) }}
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted",
                  t.id === template && "bg-primary/8",
                )}
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                  {t.id === template && <Check className="h-4 w-4 text-primary" />}
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">{t.label}</span>
                  <span className="block text-xs text-muted-foreground">{t.description}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme color picker */}
      <div className="relative" ref={themeRef}>
        <button
          type="button"
          onClick={() => { setThemeOpen((o) => !o); setTplOpen(false) }}
          aria-expanded={themeOpen}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Palette className="h-4 w-4 text-muted-foreground" />
          <span
            className="h-4 w-4 rounded-full ring-1 ring-black/10"
            style={{ background: activeTheme.accent }}
          />
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        {themeOpen && (
          <div className="absolute left-0 top-full z-40 mt-1.5 w-44 rounded-xl border border-border bg-popover p-1 shadow-lg">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => { onThemeChange(t.id); setThemeOpen(false) }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
                  t.id === theme && "bg-primary/8",
                )}
              >
                <span
                  className="h-5 w-5 rounded-full ring-1 ring-black/10"
                  style={{ background: t.accent }}
                />
                <span className="flex-1 font-medium text-foreground">{t.label}</span>
                {t.id === theme && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <span className="ml-auto" />

      {/* Right actions */}
      <Button
        variant="outline"
        size="sm"
        onClick={onOptimize}
        disabled title="Tính năng AI hiện chưa khả dụng"
        className="gap-1.5"
      >
        {aiLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 text-primary" />
        )}
        <span className="hidden sm:inline">Tối ưu bằng AI</span>
      </Button>

      <Button variant="outline" size="sm" onClick={onSave} disabled title="Lưu CV hiện chưa khả dụng" className="gap-1.5">
        {saveState === "saving" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saveState === "saved" ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {saveState === "saved" ? "Đã lưu" : "Lưu"}
        </span>
      </Button>

      <Button variant="outline" size="sm" onClick={onSaveAsDefault} disabled title="Lưu CV hiện chưa khả dụng" className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
        {saveState === "default-saved" ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
        <span className="hidden lg:inline">
          {saveState === "default-saved" ? "Đã đặt mặc định" : "Lưu thành mặc định"}
        </span>
      </Button>

      <Button size="sm" onClick={onDownloadPDF} className="gap-1.5">
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Tải file PDF</span>
      </Button>
    </header>
  )
}
