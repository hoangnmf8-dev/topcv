"use client";

import { useRef } from "react";
import { CvErrors } from "../validation-errors";
import { Camera, Trash2, User } from "lucide-react";
import { Field, TextInput } from "@/components/cv/field";
import type { CVData } from "@/lib/cv-layout";

type Personal = CVData["personal"];

export function PersonalSection({
  value,
  onChange,
  onAvatarChange,
  avatar,
}: {
  avatar: string;
  onAvatarChange: (file: File | null) => void;
  value: Personal;
  onChange: (v: Personal) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (key: keyof Personal, v: string) =>
    onChange({ ...value, [key]: v });
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onAvatarChange(file);
    e.target.value = "";
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border">
          {avatar ? (
            <img
              src={avatar}
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
          {avatar && (
            <button
              type="button"
              onClick={() => onAvatarChange(null)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa ảnh
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Họ và tên" className="col-span-2">
          <TextInput
            value={value.fullName}
            onChange={(e) => set("fullName", e.target.value)}
          />
          <CvErrors path="data.personal.fullName" />
        </Field>
        <Field label="Chức danh" className="col-span-2">
          <TextInput
            value={value.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="VD: Front-end Developer"
          />
          <CvErrors path="data.personal.title" />
        </Field>
        <Field label="Số điện thoại">
          <TextInput
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <CvErrors path="data.personal.phone" />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
          />
          <CvErrors path="data.personal.email" />
        </Field>
        <Field label="Địa chỉ" className="col-span-2">
          <TextInput
            value={value.address}
            onChange={(e) => set("address", e.target.value)}
          />
          <CvErrors path="data.personal.address" />
        </Field>
        <Field label="GitHub">
          <TextInput
            value={value.github}
            onChange={(e) => set("github", e.target.value)}
          />
          <CvErrors path="data.personal.github" />
        </Field>
        <Field label="LinkedIn">
          <TextInput
            value={value.linkedin}
            onChange={(e) => set("linkedin", e.target.value)}
          />
          <CvErrors path="data.personal.linkedin" />
        </Field>
      </div>
    </div>
  );
}
