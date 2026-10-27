"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  SlidersHorizontal,
  X,
} from "lucide-react";
import { CvErrors } from "./validation-errors";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  TEMPLATES,
  THEMES,
  type TemplateId,
  type ThemeId,
} from "@/lib/cv-layout";

function useClickOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

export function ControlBar({
  title,
  onTitleChange,
  template,
  onTemplateChange,
  theme,
  onThemeChange,
  onSave,
  onSaveAsDefault,
  onDownloadPDF,
  saveState,
}: {
  title: string;
  onTitleChange: (v: string) => void;
  template: TemplateId;
  onTemplateChange: (v: TemplateId) => void;
  theme: ThemeId;
  onThemeChange: (v: ThemeId) => void;
  onSave: () => void;
  onSaveAsDefault: () => void;
  onDownloadPDF: () => void;
  saveState: "idle" | "saving" | "saved" | "default-saved";
}) {
  const [tplOpen, setTplOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const tplRef = useClickOutside<HTMLDivElement>(() => setTplOpen(false));
  const themeRef = useClickOutside<HTMLDivElement>(() => setThemeOpen(false));
  const activeTpl = TEMPLATES.find((t) => t.id === template)!;
  const activeTheme = THEMES.find((t) => t.id === theme)!;
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="relative mx-auto flex w-full max-w-[1536px] flex-wrap items-center gap-2 px-3 py-2.5 sm:px-4">
      <div className="hidden w-full flex-wrap items-center gap-2 lg:flex">
      <Link
        href="/candidate?tab=profile"
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Danh sách CV</span>
      </Link>
      <span className="h-6 w-px bg-border" />
      <input
        disabled={saveState === "saving"}
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        aria-label="Tên CV"
        className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-semibold text-foreground outline-none transition-colors hover:border-border focus:border-primary focus:ring-3 focus:ring-primary/20 sm:max-w-xs"
      />
      <CvErrors path="title" />
      <div className="flex items-center gap-2 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
      <div className="relative" ref={tplRef}>
        <button
          type="button"
          onClick={() => {
            setTplOpen((o) => !o);
            setThemeOpen(false);
          }}
          disabled={saveState === "saving"}
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
                onClick={() => {
                  onTemplateChange(t.id);
                  setTplOpen(false);
                }}
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted",
                  t.id === template && "bg-primary/8",
                )}
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                  {t.id === template && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    {t.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {t.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relative" ref={themeRef}>
        <button
          type="button"
          onClick={() => {
            setThemeOpen((o) => !o);
            setTplOpen(false);
          }}
          disabled={saveState === "saving"}
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
                onClick={() => {
                  onThemeChange(t.id);
                  setThemeOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
                  t.id === theme && "bg-primary/8",
                )}
              >
                <span
                  className="h-5 w-5 rounded-full ring-1 ring-black/10"
                  style={{ background: t.accent }}
                />
                <span className="flex-1 font-medium text-foreground">
                  {t.label}
                </span>
                {t.id === theme && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
      </div>

      <span className="ml-auto" />
      <Button
        variant="outline"
        size="sm"
        onClick={onSave}
        disabled={saveState === "saving"}
        className="gap-1.5"
      >
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

      <Button
        variant="outline"
        size="sm"
        onClick={onSaveAsDefault}
        disabled={saveState === "saving"}
        className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
      >
        {saveState === "default-saved" ? (
          <Check className="h-4 w-4" />
        ) : (
          <Star className="h-4 w-4" />
        )}
        <span className="hidden lg:inline">
          {saveState === "default-saved"
            ? "Đã đặt mặc định"
            : "Lưu thành mặc định"}
        </span>
      </Button>

      <Button size="sm" onClick={onDownloadPDF} className="gap-1.5">
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Tải file PDF</span>
      </Button>
      </div>

      <div className="flex w-full items-center gap-2 lg:hidden">
        <Link
          href="/candidate?tab=profile"
          aria-label="Quay lại danh sách CV"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <input
          disabled={saveState === "saving"}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          aria-label="Tên CV"
          className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
        />
        <Sheet open={toolsOpen} onOpenChange={setToolsOpen}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Mở thanh công cụ CV"
            onClick={() => setToolsOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <SheetContent
            side="left"
            className="w-[min(67vw,420px)] gap-0 overflow-y-auto border-0 bg-slate-50 p-3"
            showCloseButton={false}
          >
            <div className="mb-3 flex items-center justify-between rounded-xl bg-[#087b43] px-4 py-4 text-white shadow-sm">
              <SheetHeader className="gap-0 p-0">
                <span className="text-lg font-bold">
                  top<span className="text-[#41e48d]">cv</span>
                </span>
                <SheetTitle className="text-xs font-normal text-emerald-100">
                  Công cụ chỉnh sửa CV
                </SheetTitle>
              </SheetHeader>
              <SheetClose
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 hover:text-white"
                    aria-label="Đóng thanh công cụ"
                  />
                }
              >
                <X className="size-5" />
              </SheetClose>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
              <div className="mb-3 border-b border-slate-100 px-3 pb-3">
                <p className="text-sm font-bold text-slate-800">
                  Công cụ CV
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Chọn mẫu, màu sắc và thao tác lưu
                </p>
              </div>
              <section className="border-b border-slate-100 px-1 pb-3">
                <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Mẫu CV
                </h3>
                <div className="grid gap-1">
                  {TEMPLATES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onTemplateChange(item.id)}
                      className={cn(
                        "rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                        item.id === template
                          ? "bg-[#e7f9ef] text-[#008f40] shadow-sm"
                          : "text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>
              <section className="border-b border-slate-100 px-2 py-3">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Màu chủ đạo
                </h3>
                <div className="flex flex-wrap gap-3">
                  {THEMES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      title={item.label}
                      aria-label={item.label}
                      aria-pressed={item.id === theme}
                      onClick={() => onThemeChange(item.id)}
                      className={cn(
                        "size-8 rounded-full ring-1 ring-black/10",
                        item.id === theme &&
                          "ring-2 ring-[#00b14f] ring-offset-2",
                      )}
                      style={{ background: item.accent }}
                    />
                  ))}
                </div>
              </section>
              <div className="flex flex-col gap-1 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => {
                    onSave();
                    setToolsOpen(false);
                  }}
                  disabled={saveState === "saving"}
                >
                  {saveState === "saving" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Save />
                  )}
                  {saveState === "saved" ? "Đã lưu" : "Lưu CV"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="justify-start text-slate-600 hover:bg-slate-50"
                  onClick={() => {
                    onSaveAsDefault();
                    setToolsOpen(false);
                  }}
                  disabled={saveState === "saving"}
                >
                  <Star />
                  {saveState === "default-saved"
                    ? "Đã đặt mặc định"
                    : "Lưu thành mặc định"}
                </Button>
                <Button
                  type="button"
                  className="mt-2 bg-[#00b14f] text-white hover:bg-[#009f46]"
                  onClick={() => {
                    onDownloadPDF();
                    setToolsOpen(false);
                  }}
                >
                  <Download />
                  Tải file PDF
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      </div>
    </header>
  );
}
