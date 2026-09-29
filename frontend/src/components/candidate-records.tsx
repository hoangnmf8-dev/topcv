"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { httpRequest } from "@/lib/utils";
import { formatJobSalary } from "@/lib/job-salary";
import { useAccountStore } from "@/stores/auth.store";
export type RecordJob={id:string;title:string;salaryMin:string|null;salaryMax:string|null;currency:string|null;status:string;deletedAt:string|null;deadlineAt:string|null;company:{name:string;deletedAt:string|null};province:{name:string}};
type Row={id?:string;jobPostId:string;status?:string;createdAt?:string;appliedAt?:string;updatedAt?:string;coverLetter?:string|null;cv?:{title:string}|null;jobPost:RecordJob};
export function ReadJob({job}:{job:RecordJob}) {
 const available=job.status==="PUBLISHED"&&!job.deletedAt&&!job.company.deletedAt&&(!job.deadlineAt||new Date(job.deadlineAt)>new Date());
 return <div><h3 className="font-semibold">{available?<Link className="hover:text-emerald-700" href={"/jobs/"+job.id}>{job.title}</Link>:job.title}</h3><p className="mt-1 text-sm text-slate-500">{job.company.name} · {job.province.name}</p><p className="mt-2 text-sm font-semibold text-emerald-700">{formatJobSalary(job.salaryMin,job.salaryMax,job.currency??"VND")}</p>{!available&&<p className="mt-2 text-xs text-amber-700">Tin không còn nhận hồ sơ</p>}</div>;
}
const labels:Record<string,string>={submitted:"Đã nộp",reviewing:"Đang xem xét",interview:"Phỏng vấn",hired:"Đã tuyển",rejected:"Từ chối"};
export function CandidateRecords({kind}:{kind:"applications"|"saved"}) {
 const account=useAccountStore(s=>s.account);
 const [search,setSearch]=useState(""),[keyword,setKeyword]=useState(""),[status,setStatus]=useState(""),[page,setPage]=useState(1);
 const query=useQuery<{items:Row[];total:number;totalPages:number}>({queryKey:["candidate-records",account?.id,kind,keyword,status,page],enabled:!!account,
 placeholderData:(previous, previousQuery)=>previousQuery?.queryKey[1]===account?.id && previousQuery?.queryKey[2]===kind ? previous : undefined,
 queryFn:async({signal})=>(await httpRequest.get<{items:Row[];total:number;totalPages:number}>("/candidate/me/"+kind,{signal,params:{page,query:keyword,...(kind==="applications"&&status?{status}:{})}})).data});
 if(!account)return <p className="rounded-2xl bg-white p-6">Vui lòng đăng nhập tài khoản ứng viên.</p>;
 return <section className="rounded-2xl border bg-white p-6 shadow-sm">
 <h2 className="text-xl font-bold">{kind==="applications"?"Việc đã ứng tuyển":"Việc làm đã lưu"}</h2>
 <form className="my-5 flex flex-wrap gap-3" onSubmit={e=>{e.preventDefault();setKeyword(search.trim());setPage(1);}}>
 <input aria-label="Tìm việc trong danh sách" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tên việc, công ty, địa điểm" className="min-w-0 flex-1 rounded-xl border px-3 py-2"/>
 {kind==="applications"&&<select aria-label="Trạng thái ứng tuyển" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} className="rounded-xl border px-3"><option value="">Tất cả trạng thái</option>{Object.entries(labels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select>}
 <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white">Tìm kiếm</button>
 {(keyword||status)&&<button type="button" onClick={()=>{setSearch("");setKeyword("");setStatus("");setPage(1);}} className="text-emerald-700">Xóa lọc</button>}
 </form>
 {query.isPending?<p role="status">Đang tải...</p>:query.isError?<p role="alert">Không tải được danh sách. <button onClick={()=>void query.refetch()} className="text-emerald-700">Thử lại</button></p>:<div aria-busy={query.isFetching} className={query.isFetching?"opacity-60":""}>
 <p className="text-sm text-slate-500">{query.data.total} việc làm</p>
 {!query.data.items.length?<div className="py-10 text-center"><p>{keyword||status?"Không có kết quả phù hợp.":kind==="applications"?"Bạn chưa ứng tuyển công việc nào.":"Bạn chưa lưu việc làm nào."}</p><Link href="/discover/jobs-by-field" className="mt-3 inline-block text-emerald-700">Khám phá việc làm</Link></div>:<ul className="divide-y">{query.data.items.map(row=><li key={row.id??row.jobPostId} className="py-5">
 <div className="flex flex-wrap justify-between gap-3"><ReadJob job={row.jobPost}/>{row.status&&<span className="h-fit rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">{labels[row.status]??row.status}</span>}</div>
 <p className="mt-3 text-xs text-slate-500">{row.appliedAt?"Ngày ứng tuyển: ":"Ngày lưu: "}{new Date(row.appliedAt??row.createdAt!).toLocaleDateString("vi-VN")}</p>
 {row.cv&&<p className="mt-2 text-sm">CV: {row.cv.title}</p>}
 {row.coverLetter&&<details className="mt-2 text-sm"><summary>Thư ứng tuyển</summary><p className="mt-2 whitespace-pre-wrap">{row.coverLetter}</p></details>}
 </li>)}</ul>}
 {query.data.totalPages>1&&<nav aria-label="Phân trang" className="mt-5 flex justify-center gap-4"><button disabled={page===1||query.isFetching} onClick={()=>setPage(p=>p-1)} className="disabled:opacity-40">Trước</button><span>{page}/{query.data.totalPages}</span><button disabled={page>=query.data.totalPages||query.isFetching} onClick={()=>setPage(p=>p+1)} className="disabled:opacity-40">Sau</button></nav>}
 </div>}
 </section>;
}
