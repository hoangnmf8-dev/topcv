"use client";
import Link from "next/link";
import { useCvAccess } from "@/hooks/use-cv-access";
import { UploadCvDialog } from "./upload-cv-dialog";
export function CvCreateActions() {
  const access = useCvAccess();
  return <div className="flex flex-wrap gap-3"><UploadCvDialog />{access.data?.canCreate ? <Link href="/cv-builder?new=1" className="rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white">Tạo CV mới</Link> : <button disabled className="rounded-xl bg-slate-100 px-4 py-2.5 text-slate-500">{access.isPending ? "Đang kiểm tra hạn mức…" : "Đã đạt giới hạn CV"}</button>}</div>;
}
