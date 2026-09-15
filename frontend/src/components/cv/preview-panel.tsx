"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { CVDocument } from "./cv-document"
import type { CVData, TemplateId, ThemeId } from "@/lib/cv-data"

const A4_WIDTH = 794 // 210mm @ 96dpi
const A4_HEIGHT = 1123 // 297mm @ 96dpi
const MIN_ZOOM = 0.35
const MAX_ZOOM = 1.5

export function PreviewPanel({
  data,
  template,
  theme,
}: {
  data: CVData
  template: TemplateId
  theme: ThemeId
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(0.7)
  const [autoFit, setAutoFit] = useState(true)

  const computeFit = useCallback(() => {
    const el = viewportRef.current
    if (!el) return 0.7
    const available = el.clientWidth - 64 // padding allowance
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, available / A4_WIDTH))
  }, [])

  const fitToScreen = useCallback(() => {
    setZoom(computeFit())
    setAutoFit(true)
  }, [computeFit])

  useEffect(() => {
    fitToScreen()
    const onResize = () => {
      setAutoFit((af) => {
        if (af) setZoom(computeFit())
        return af
      })
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [computeFit, fitToScreen])

  const adjust = (delta: number) => {
    setAutoFit(false)
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + delta).toFixed(2))))
  }

  return (
    <div className="relative flex h-full flex-col bg-muted/40">
      <div
        ref={viewportRef}
        className="scrollbar-slim flex-1 overflow-auto p-8"
      >
        <div
          className="mx-auto"
          style={{ width: A4_WIDTH * zoom, height: A4_HEIGHT * zoom }}
        >
          <div
            id="cv-print-area"
            className="overflow-hidden rounded-sm bg-white shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5"
            style={{
              width: A4_WIDTH,
              minHeight: A4_HEIGHT,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
            <CVDocument data={data} template={template} theme={theme} />
          </div>
        </div>
      </div>

      {/* Floating zoom bar */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-background/95 p-1 shadow-lg backdrop-blur">
        <ZoomBtn onClick={() => adjust(-0.1)} label="Thu nhỏ">
          <Minus className="h-4 w-4" />
        </ZoomBtn>
        <span className="pointer-events-auto min-w-12 select-none text-center text-xs font-medium tabular-nums text-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <ZoomBtn onClick={() => adjust(0.1)} label="Phóng to">
          <Plus className="h-4 w-4" />
        </ZoomBtn>
        <span className="mx-0.5 h-5 w-px bg-border" />
        <ZoomBtn onClick={fitToScreen} label="Vừa màn hình" active={autoFit}>
          <Maximize2 className="h-4 w-4" />
        </ZoomBtn>
        <ZoomBtn onClick={() => { setAutoFit(false); setZoom(1) }} label="Đặt lại 100%">
          <RotateCcw className="h-4 w-4" />
        </ZoomBtn>
      </div>
    </div>
  )
}

function ZoomBtn({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void
  label: string
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
      )}
    >
      {children}
    </button>
  )
}
