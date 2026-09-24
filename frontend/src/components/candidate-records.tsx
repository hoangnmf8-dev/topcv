"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { candidateService } from "@/services/candidate.service";
import { useAccountStore } from "@/stores/auth.store";
const labels:Record<string,string>={submitted:"Đã nộp",reviewing:"Đang xem xét",interview:"Phỏng vấn",hired:"Đã tuyển",rejected:"Từ chối"};
export function CandidateRecords({kind}:{kind:"applications"|"saved"}){
  const accountId=useAccountStore(s=>s.account?.id),client=useQueryClient();
  const [search,setSearch]=useState("");
  const query=useQuery({queryKey:["candidate-records",kind,accountId],queryFn:async()=>kind==="applications"?(await candidateService.applications()).data:(await candidateService.saved()).data,enabled:!!accountId});
  const remove=useMutation({mutationFn:candidateService.removeSaved,onSuccess:result=>{toast.success(result.message);client.invalidateQueries({queryKey:["candidate-records","saved"]});},onError:error=>toast.error(error.message)});
  const rows=(query.data??[]).filter(r=>(r.jobPost.title+" "+r.jobPost.company.name+" "+r.jobPost.location.name).toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")));
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">{kind==="applications"?"Việc đã ứng tuyển":"Việc làm đã lưu"}</h2><div className="my-5 flex flex-wrap items-center justify-between gap-3"><p>{rows.length} / {query.data?.length??0} việc làm</p><input aria-label="Tìm việc trong danh sách" className="rounded-xl border px-3 py-2" placeholder="Tên việc, công ty, địa điểm" value={search} onChange={e=>setSearch(e.target.value)}/></div>
    {query.isPending?<p>Đang tải...</p>:query.isError?<p className="text-red-600">{query.error.message} <button onClick={()=>query.refetch()}>Thử lại</button></p>:!rows.length?<p className="py-10 text-center text-slate-500">{search?"Không có kết quả phù hợp.":kind==="applications"?"Bạn chưa ứng tuyển công việc nào.":"Bạn chưa lưu việc làm nào."}</p>:<ul className="divide-y">{rows.map(row=><li key={"id" in row?row.id:row.jobPostId} className="py-5"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold">{row.jobPost.title}</h3><p className="mt-1 text-sm text-slate-500">{row.jobPost.company.name} · {row.jobPost.location.name}</p></div>{"status" in row?<span className="h-fit rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">{labels[row.status]??row.status}</span>:<button disabled={remove.isPending} onClick={()=>remove.mutate(row.jobPostId)} className="text-sm font-semibold text-emerald-700 disabled:opacity-50">Bỏ lưu</button>}</div><p className="mt-2 text-sm text-slate-500">{"appliedAt" in row?"Ngày ứng tuyển: ":"Ngày lưu: "}{new Date("appliedAt" in row?row.appliedAt:row.createdAt).toLocaleDateString("vi-VN")}</p>{"updatedAt" in row&&<p className="text-sm text-slate-500">Cập nhật: {new Date(row.updatedAt).toLocaleDateString("vi-VN")}</p>}{"coverLetter" in row&&row.coverLetter&&<details className="mt-3 text-sm"><summary className="cursor-pointer">Thư ứng tuyển{row.cv?" · "+row.cv.title:""}</summary><p className="mt-2 whitespace-pre-wrap">{row.coverLetter}</p></details>}</li>)}</ul>}
  </section>;
}
