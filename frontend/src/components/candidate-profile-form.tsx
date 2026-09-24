"use client";
import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { candidateService, type ProfileInput } from "@/services/candidate.service";
import locationService from "@/services/location.service";
import { useCandidateStore } from "@/stores/candidate.store";
import { useAccountStore } from "@/stores/auth.store";
import type { Candidate, Provice } from "@/types";
export function CandidateProfileForm(){
  const accountId=useAccountStore(s=>s.account?.id);
  const query=useQuery({queryKey:["candidate-profile",accountId],queryFn:candidateService.profile,enabled:!!accountId});
  if(query.isPending)return <p className="p-6">Đang tải hồ sơ...</p>;
  if(query.isError)return <p className="p-6 text-red-600">{query.error.message} <button onClick={()=>query.refetch()}>Thử lại</button></p>;
  return <ProfileEditor key={JSON.stringify(query.data.data)} profile={query.data.data}/>;
}
function ProfileEditor({profile}:{profile:Candidate}){
  const [draft,setDraft]=useState<ProfileInput>({fullName:profile.fullName,phone:profile.phone??"",headline:profile.headline??"",careerGoal:profile.careerGoal??"",experienceYears:Number(profile.experienceYears??0),currentLocationId:profile.currentLocationId?String(profile.currentLocationId):null,isSearchable:profile.isSearchable??false});
  const client=useQueryClient();
  const provinces=useQuery({queryKey:["profile-provinces"],queryFn:async()=>{const r=await locationService.getProvince();if(!r.success)throw new Error(r.message);return r.data as Provice[];}});
  const mutation=useMutation({mutationFn:candidateService.update,onSuccess:async result=>{
    const current=useCandidateStore.getState().candidate;
    useCandidateStore.getState().updateCandidate({...result.data,avatarUrl:current?.avatarUrl??null});
    useAccountStore.getState().updateCandidate(result.data);
    toast.success(result.message);
    await client.invalidateQueries({queryKey:["candidate-profile"]});
  },onError:error=>toast.error(error.message)});
  function submit(event:FormEvent){event.preventDefault();mutation.mutate(draft);}
  const input="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal";
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Chỉnh sửa hồ sơ ứng viên</h2><form onSubmit={submit}><fieldset disabled={mutation.isPending} className="mt-5 grid gap-5 sm:grid-cols-2 disabled:opacity-60">
    <label className="text-sm font-semibold">Họ và tên<input required maxLength={150} className={input} value={draft.fullName} onChange={e=>setDraft({...draft,fullName:e.target.value})}/></label>
    <label className="text-sm font-semibold">Số điện thoại<input type="tel" maxLength={30} className={input} value={draft.phone} onChange={e=>setDraft({...draft,phone:e.target.value})}/></label>
    <label className="text-sm font-semibold">Tiêu đề nghề nghiệp<input maxLength={255} className={input} value={draft.headline} onChange={e=>setDraft({...draft,headline:e.target.value})}/></label>
    <label className="text-sm font-semibold">Số năm kinh nghiệm<input required type="number" min={0} max={80} step="0.1" className={input} value={draft.experienceYears} onChange={e=>setDraft({...draft,experienceYears:Number(e.target.value)})}/></label>
    <label className="text-sm font-semibold">Địa điểm hiện tại<select className={input} value={draft.currentLocationId??""} onChange={e=>setDraft({...draft,currentLocationId:e.target.value||null})}><option value="">Chưa chọn địa điểm</option>{provinces.data?.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>{provinces.isError&&<button type="button" onClick={()=>provinces.refetch()} className="text-red-600">Không tải được địa điểm. Thử lại</button>}</label>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isSearchable} onChange={e=>setDraft({...draft,isSearchable:e.target.checked})}/>Cho phép nhà tuyển dụng tìm thấy hồ sơ</label>
    <label className="text-sm font-semibold sm:col-span-2">Mục tiêu nghề nghiệp<textarea rows={4} maxLength={10000} className={input} value={draft.careerGoal} onChange={e=>setDraft({...draft,careerGoal:e.target.value})}/></label>
    <div className="sm:col-span-2"><button className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white">{mutation.isPending?"Đang lưu...":"Lưu hồ sơ"}</button></div>
  </fieldset></form></section>;
}
