"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cvKeys } from "@/cache-key/cv.key";
import cvService from "@/services/cv.service";
import { useAccountStore } from "@/stores/auth.store";
import type { CvSummary } from "@/types/cv.type";

export function CvList() {
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
        client.invalidateQueries({queryKey:["candidate-overview",accountId]}),
        client.invalidateQueries({queryKey:["candidate-records",accountId]}),
      ]);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Không xóa được CV. Vui lòng thử lại."),
  });

  return <div className="mt-6 space-y-4">
    <h3 className="font-bold">Danh sách CV</h3>
    {query.isPending && <LoadingState message="Đang tải CV…" />}
    {query.isError && <button onClick={()=>void query.refetch()} className="text-red-600">Không tải được CV. Thử lại</button>}
    {query.isSuccess && !query.data.length && <p className="text-sm text-slate-500">Bạn chưa có CV. Chọn Tạo CV mới để bắt đầu.</p>}
    <div className="grid gap-4 xl:grid-cols-2">
      {query.data?.map(cv => <article key={cv.id} className="rounded-xl border p-4">
        <h4 className="font-semibold">{cv.title} {cv.isDefault && <span className="text-xs text-emerald-700">Mặc định</span>}</h4>
        <p className="my-2 text-xs text-slate-500">Cập nhật: {new Date(cv.updatedAt).toLocaleString("vi-VN")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {cv.isEditable ? <Link href={`/cv-builder?id=${cv.id}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"><Pencil className="size-4" />Chỉnh sửa CV</Link> : <Button variant="outline" disabled title="CV PDF không có nội dung chỉnh sửa"><Pencil />Chỉnh sửa CV</Button>}
          <Button variant="destructive" disabled={deletion.isPending} onClick={()=>{deletion.reset();setSelected(cv);}}><Trash2 />Xóa CV</Button>
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
