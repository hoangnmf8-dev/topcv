"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { UploadCloud, Send, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAccountStore } from "@/stores/auth.store";
import { useApplicationStatus } from "@/hooks/use-application-status";
import { cvKeys } from "@/cache-key/cv.key";
import cvService from "@/services/cv.service";
import uploadService from "@/services/upload.service";
import applicationService from "@/services/application.service";
import { UPLOAD } from "@/constants/upload.constant";
import type { JobCardData, SavedCvOption } from "@/types";

type Props = { job: JobCardData | null; open: boolean; onOpenChange: (open: boolean) => void; savedCvOptions?: SavedCvOption[] };
export function QuickApplyDialog({ job, open, onOpenChange }: Props) {
  const account = useAccountStore(state => state.account);
  const accountId = account?.id ?? "";
  const client = useQueryClient();
  const [cvId, setCvId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const uploaded = useRef<{ objectKey: string; cvId?: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const cvs = useQuery({ queryKey: cvKeys.list(accountId), enabled: open && account?.role === "candidate", queryFn: ({signal}) => cvService.list(signal) });
  const status = useApplicationStatus(job?.id ?? "", open);
  const options = (cvs.data ?? []).filter(cv => cv.isEditable || cv.fileKey);
  useEffect(() => {
    if (open && !file && cvs.data && (!cvId || !cvs.data.some(cv => cv.id === cvId))) {
      const valid = cvs.data.filter(cv => cv.isEditable || cv.fileKey);
      setCvId((valid.find(cv => cv.isDefault) ?? valid[0])?.id ?? "");
    }
  }, [open, file, cvs.data, cvId]);
  useEffect(() => { if (!open) { setCvId(""); setFile(null); setCoverLetter(""); setError(""); setProgress(0); uploaded.current = null; } }, [open, job?.id]);
  function changeOpen(value: boolean) { if (!lock.current) onOpenChange(value); }
  function selectFile(value: File | null) {
    if (!value) return;
    if (!/\.pdf$/i.test(value.name) || (value.type && value.type !== "application/pdf")) { setError("Chỉ chấp nhận file PDF."); return; }
    if (!value.size || value.size > UPLOAD.CV_SIZE) { setError("CV PDF phải có dung lượng từ 1 byte đến 10 MB."); return; }
    setFile(value.type ? value : new File([value], value.name, {type: "application/pdf"})); setCvId(""); setError(""); setProgress(0); uploaded.current = null;
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !job || account?.role !== "candidate" || status.data || (!cvId && !file)) return;
    lock.current = true; setBusy(true); setError("");
    try {
      let selected = cvId;
      if (file) {
        if (!uploaded.current) {
          if (await file.slice(0, 5).text() !== "%PDF-") throw new Error("Nội dung file không phải PDF.");
          const presign = await uploadService.getPresignedUrl(file, "cv");
          await uploadService.uploadCvPdf(presign.data.uploadUrl, file, setProgress);
          uploaded.current = {objectKey: presign.data.objectKey};
        }
        if (!uploaded.current.cvId) {
          const cv = await uploadService.completeCv(uploaded.current.objectKey, file.name.replace(/\.pdf$/i, "").slice(0,255) || "CV ứng tuyển", false);
          uploaded.current.cvId = cv.id;
          await Promise.all([client.invalidateQueries({queryKey:cvKeys.all(accountId)}),client.invalidateQueries({queryKey:["profile-completion",accountId]})]);
        }
        selected = uploaded.current.cvId!;
      }
      const result = await applicationService.create({jobPostId: job.id, cvId: selected, coverLetter: coverLetter.trim()});
      client.setQueryData(["application-status",accountId,job.id],result);
      await Promise.all([client.invalidateQueries({queryKey:["candidate-records",accountId,"applications"]}),client.invalidateQueries({queryKey:["candidate-overview",accountId]}),client.invalidateQueries({queryKey:["application-status",accountId,job.id]})]);
      toast.success("Đã nộp hồ sơ ứng tuyển");
      onOpenChange(false);
    } catch (failure) {
      const code = isAxiosError(failure) ? failure.response?.data?.errors?.code : undefined;
      if (code === "ALREADY_APPLIED") await client.invalidateQueries({queryKey:["application-status",accountId,job?.id]});
      const message = isAxiosError(failure) ? failure.response?.data?.errors?.message ?? failure.response?.data?.message : failure instanceof Error ? failure.message : undefined;
      setError(message ?? "Không thể nộp hồ sơ. Vui lòng thử lại; CV đã tải lên được giữ để tránh tải lại.");
    } finally { lock.current = false; setBusy(false); }
  }
  const candidate = account?.role === "candidate";
  return <Dialog open={open} onOpenChange={changeOpen}><DialogContent showCloseButton={!busy} className="flex max-h-[90dvh] min-w-0 flex-col overflow-hidden p-0 sm:max-w-lg"><DialogHeader className="px-5 pt-5"><DialogTitle>Ứng tuyển nhanh</DialogTitle><DialogDescription>Vị trí {job?.title} tại {job?.company}</DialogDescription></DialogHeader>
  {!candidate ? <div className="p-5"><p className="mb-4">{account ? "Chỉ tài khoản ứng viên được nộp hồ sơ." : "Vui lòng đăng nhập để ứng tuyển."}</p>{!account&&<Link href="/login" className="text-emerald-700 underline">Đăng nhập</Link>}</div> :
  status.data ? <div className="p-5"><p role="status" className="font-semibold text-emerald-700">Bạn đã ứng tuyển công việc này.</p><Link href="/candidate?tab=applications" className="mt-3 inline-block text-emerald-700 underline">Xem hồ sơ đã ứng tuyển</Link></div> :
  <form onSubmit={submit} className="flex min-h-0 min-w-0 flex-col overflow-hidden"><div className="min-h-0 space-y-5 overflow-y-auto overflow-x-hidden p-5"><fieldset disabled={busy} className="min-w-0 space-y-5">
  <label className="block text-sm font-semibold">Chọn CV từ hệ thống<select value={cvId} disabled={cvs.isPending || !options.length} onChange={event=>{setCvId(event.target.value);setFile(null);uploaded.current=null;setError("");}} className="mt-2 h-10 w-full min-w-0 rounded-lg border px-3 font-normal"><option value="">{cvs.isPending?"Đang tải CV…":options.length?"Chọn CV có sẵn":"Chưa có CV có sẵn"}</option>{options.map(cv=><option key={cv.id} value={cv.id}>{cv.title}{cv.isDefault?" · Mặc định":""}</option>)}</select></label>
  {cvs.isError&&<p role="alert" className="text-sm text-red-600">Không tải được CV. <button type="button" className="underline" onClick={()=>void cvs.refetch()}>Thử lại</button></p>}
  <div><p className="mb-2 text-sm font-semibold">Hoặc tải lên CV (PDF)</p><input ref={input} type="file" accept=".pdf,application/pdf" className="hidden" onChange={event=>selectFile(event.target.files?.[0] ?? null)}/>{file?<div className="flex min-w-0 items-center gap-2 rounded-lg border p-3"><span className="min-w-0 flex-1 truncate text-sm">{file.name}</span><Button type="button" variant="ghost" size="icon-sm" aria-label="Bỏ file PDF" onClick={()=>{setFile(null);uploaded.current=null;if(input.current)input.current.value="";}}><X /></Button></div>:<button type="button" onClick={()=>input.current?.click()} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();selectFile(event.dataTransfer.files[0] ?? null);}} className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-sm hover:border-emerald-500 hover:bg-emerald-50"><UploadCloud />Kéo thả hoặc chọn PDF · tối đa 10 MB</button>}</div>
  <label className="block text-sm font-semibold">Thư giới thiệu <span className="font-normal text-slate-500">(không bắt buộc)</span><textarea value={coverLetter} maxLength={3000} onChange={event=>setCoverLetter(event.target.value)} rows={5} className="mt-2 w-full rounded-lg border p-3 font-normal" placeholder="Giới thiệu kinh nghiệm và lý do bạn phù hợp với vị trí này"/><span className="text-xs font-normal text-slate-500">{coverLetter.length}/3000 ký tự</span></label></fieldset>
  {busy&&<p role="status" className="text-sm text-emerald-700">{file&&progress<100 ? `Đang tải CV ${progress}%…` : "Đang nộp hồ sơ…"}</p>}
  {error&&<p role="alert" className="text-sm text-red-600">{error}</p>}
  {status.isError&&<p role="alert" className="text-sm text-red-600">Không kiểm tra được trạng thái ứng tuyển. <button type="button" onClick={()=>void status.refetch()} className="underline">Thử lại</button></p>}
  </div><DialogFooter className="mx-0 mb-0 shrink-0 border-t p-5"><Button type="button" variant="outline" disabled={busy} onClick={()=>changeOpen(false)}>Hủy</Button><Button type="submit" disabled={busy||status.isPending||status.isError||(!cvId&&!file)}>{busy?<Loader2 className="animate-spin"/>:<Send/>}{busy?"Đang nộp…":"Nộp hồ sơ"}</Button></DialogFooter></form>}</DialogContent></Dialog>;
}
