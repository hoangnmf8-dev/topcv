"use client"

import { useRef } from "react"
import { Camera, Trash2, User } from "lucide-react"
import { Field, TextInput } from "@/components/cv/field"
import type { CVData } from "@/lib/cv-layout"

type Personal = CVData["personal"]

export function PersonalSection({
  value,
  onChange,
}: {
  value: Personal
  onChange: (v: Personal) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (key: keyof Personal, v: string) => onChange({ ...value, [key]: v })

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set("avatar", reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Avatar upload */}
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border">
          {value.avatar ? (
            <img
              src={value.avatar || "/placeholder.svg"}
              alt="Ảnh đại diện"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <User className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Camera className="h-4 w-4" />
            Tải ảnh lên
          </button>
          {value.avatar && (
            <button
              type="button"
              onClick={() => set("avatar", "")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa ảnh
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Họ và tên" className="col-span-2">
          <TextInput value={value.fullName} onChange={(e) => set("fullName", e.target.value)} />
        </Field>
        <Field label="Chức danh" className="col-span-2">
          <TextInput
            value={value.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="VD: Front-end Developer"
          />
        </Field>
        <Field label="Số điện thoại">
          <TextInput value={value.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
        <Field label="Địa chỉ" className="col-span-2">
          <TextInput value={value.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
        <Field label="GitHub">
          <TextInput value={value.github} onChange={(e) => set("github", e.target.value)} />
        </Field>
        <Field label="LinkedIn">
          <TextInput value={value.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
        </Field>
      </div>
    </div>
  )
}
