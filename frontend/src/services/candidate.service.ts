import { httpRequest } from "@/lib/utils";
import type { Candidate } from "@/types";
export type ProfileInput = { fullName:string; phone:string; headline:string; careerGoal:string; experienceYears:number; currentLocationId:string|null; isSearchable:boolean };
export type CandidateJob = {id:string;title:string;status:string;salaryMin:string|null;salaryMax:string|null;currency:string|null;deadlineAt:string|null;company:{name:string};location:{name:string}};
export type ApplicationRow = {id:string;status:string;coverLetter:string|null;appliedAt:string;updatedAt:string;cv:{id:string;title:string}|null;jobPost:CandidateJob};
export type SavedRow = {jobPostId:string;createdAt:string;jobPost:CandidateJob};
async function request<T>(method:"get"|"patch"|"delete", path:string, data?:unknown):Promise<{data:T;message:string}> {
  try {
    const result = await httpRequest.request({method,url:"/candidate"+path,data});
    if (!result.data.success) throw new Error(result.data.message || "Không thể xử lý yêu cầu");
    return result.data;
  } catch(error) {
    const response = (error as {response?:{data?:{message?:string;errors?:{message?:string}}}}).response;
    throw new Error(response?.data?.message || response?.data?.errors?.message || (error instanceof Error ? error.message : "Không thể kết nối máy chủ"));
  }
}
export const candidateService = {
  profile:()=>request<Candidate>("get","/me"),
  update:(data:ProfileInput)=>request<Candidate>("patch","/me",data),
  applications:()=>request<ApplicationRow[]>("get","/applications"),
  saved:()=>request<SavedRow[]>("get","/saved-jobs"),
  removeSaved:(id:string)=>request<null>("delete","/saved-jobs/"+id),
};
