"use client"

import type React from "react"
import { cn } from "@/lib/utils"

export function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label?: string
  htmlFor?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="text-xs font-medium text-muted-foreground"
        >
          {label}
        </label>
      ) : null}
      {children}
    </div>
  )
}

const baseInput =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(baseInput, "h-9", className)} {...props} />
}

export function TextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(baseInput, "min-h-24 resize-y leading-relaxed", className)}
      {...props}
    />
  )
}
