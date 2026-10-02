"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Trash2, FileText } from "lucide-react";
import uploadService from "@/services/upload.service";
import { toast } from "sonner";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cvKeys } from "@/cache-key/cv.key";
import cvService from "@/services/cv.service";
import { useAccountStore } from "@/stores/auth.store";
import type { CvSummary } from "@/types/cv.type";
import { useCvAccess } from "@/hooks/use-cv-access";

export function CvList() {
  const access = useCvAccess();
  const [viewing, setViewing] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState("");
  async function viewPdf(cv: CvSummary) {
    if (!cv.fileKey) return;
    setViewing(cv.id); setPdfUrl(null); setPdfError("");
    try { setPdfUrl(await uploadService.getUrlFile(cv.fileKey)); }
    catch { setPdfError("Không thể mở CV. Vui lòng thử lại."); }
  }
  const account = useAccountStore(s => s.account);
  const accountId = account?.id ?? "";
  const client = useQueryClient();
  const [selected, setSelected] = useState<CvSummary | null>(null);
  const query = useQuery({queryKey:cvKeys.list(accountId),enabled:account?.role==="candidate",queryFn:({signal})=>cvService.list(signal)});
  const deletion = useMutation({
    mutationFn: (id:string) => cvService.remove(id),
    onSuccess: async (_, id) => {
      client.setQueryData<CvSummary[]>(cvKeys.list(accountId), rows => rows?.filter(cv => cv.id !== id));
      client.removeQueries({queryKey:cvKeys.detail(accountId,id),exact:true});
      setSelected(null);
      toast.success("Đã xóa CV");
      await Promise.all([
        client.invalidateQueries({queryKey:cvKeys.all(accountId)}),
        client.invalidateQueries({queryKey:["cv-access",accountId]}),
        client.invalidateQueries({queryKey:["candidate-overview",accountId]}),
        client.invalidateQueries({queryKey:["profile-completion",accountId]}),
        client.invalidateQueries({queryKey:["candidate-records",accountId]}),
      ]);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Không xóa được CV. Vui lòng thử lại."),
  });

  return <div className="mt-6 space-y-4">
    <h3 className="font-bold">Danh sách CV</h3>
    {access.data && <p className="text-sm text-slate-500">Gói {access.data.planName}: {access.data.count}/{access.data.limit} CV</p>}
    {access.data?.editingLocked && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><b>Bạn đã vượt giới hạn CV của gói hiện tại.</b><p className="mt-2">Bạn đang có {access.data.count}/{access.data.limit} CV. Chỉnh sửa toàn bộ CV tạm khóa. Hãy xóa bớt để còn tối đa {access.data.limit} CV hoặc nâng cấp Pro.</p><Link href="/services" className="mt-2 inline-block font-bold underline">Nâng cấp Pro</Link></div>}
    <Dialog open={!!viewing} onOpenChange={open=>{if(!open){setViewing(null);setPdfUrl(null);}}}><DialogContent className="sm:max-w-4xl"><DialogHeader><DialogTitle>Xem CV PDF</DialogTitle><DialogDescription>CV đã tải lên của bạn.</DialogDescription></DialogHeader>{pdfError?<p role="alert" className="text-red-600">{pdfError}</p>:pdfUrl?<><iframe src={pdfUrl} title="CV PDF" className="h-[65vh] w-full rounded-lg border"/><a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-700 underline">Mở PDF trong tab mới</a></>:<LoadingState message="Đang tải CV PDF…" />}</DialogContent></Dialog>
    {query.isPending && <LoadingState message="Đang tải CV…" />}
    {query.isError && <button onClick={()=>void query.refetch()} className="text-red-600">Không tải được CV. Thử lại</button>}
    {query.isSuccess && !query.data.length && <p className="text-sm text-slate-500">Bạn chưa có CV. Tạo CV mới hoặc tải CV PDF lên để bắt đầu.</p>}
    <div className="grid gap-4 xl:grid-cols-2">
      {query.data?.map(cv => <article key={cv.id} className="rounded-xl border p-4">
        <h4 className="font-semibold">{cv.title} {cv.isDefault && <span className="text-xs text-emerald-700">Mặc định</span>}</h4>
        <p className="my-2 text-xs text-slate-500">Cập nhật: {new Date(cv.updatedAt).toLocaleString("vi-VN")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {cv.isEditable ? <Link href={`/cv-builder?id=${cv.id}${access.data?.editingLocked ? "&view=1" : ""}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700"><Pencil className="size-4" />{access.data?.editingLocked ? "Xem CV (khóa chỉnh sửa)" : "Chỉnh sửa CV"}</Link> : <Button className="h-10" variant="outline" disabled={!cv.fileKey} onClick={()=>void viewPdf(cv)}><FileText />Xem CV PDF</Button>}
          <Button className="h-10" variant="destructive" disabled={deletion.isPending} onClick={()=>{deletion.reset();setSelected(cv);}}><Trash2 />Xóa CV</Button>
        </div>
      </article>)}
    </div>
    <Dialog open={!!selected} onOpenChange={open=>{if(!open && !deletion.isPending)setSelected(null);}}>
      <DialogContent>
        <DialogHeader><DialogTitle>Xóa CV?</DialogTitle><DialogDescription>CV “{selected?.title}” sẽ bị ẩn khỏi danh sách và không thể dùng để ứng tuyển. Các hồ sơ ứng tuyển trước đó vẫn được giữ lại.</DialogDescription></DialogHeader>
        {deletion.isError && <p role="alert" className="text-sm text-red-600">Không xóa được CV. Bạn có thể thử lại.</p>}
        <DialogFooter>
          <Button variant="outline" disabled={deletion.isPending} onClick={()=>setSelected(null)}>Hủy</Button>
          <Button variant="destructive" disabled={deletion.isPending || !selected} onClick={()=>{if(selected && !deletion.isPending)deletion.mutate(selected.id);}}>{deletion.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}{deletion.isPending ? "Đang xóa…" : "Xóa CV"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
