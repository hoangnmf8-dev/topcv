import { prisma } from "../utils/prisma";
import type { Prisma } from "../generated/prisma/client";
import { currentPlan } from "./subscription.service";
import { AppError } from "../exceptions";

export async function jobBoostUsage(accountId:string){
 const plan=await currentPlan(accountId);
 const used=Number((plan.subscription?.usageState as {jobBoostLimit?:{used:number}}|undefined)?.jobBoostLimit?.used??0);
 const limit=plan.subscription?.plan.code==="company_pro"?Number(plan.benefits.jobBoostLimit??0):0;
 return {limit,used,remaining:Math.max(0,limit-used),planName:plan.name};
}
export async function boostJob(accountId:string,jobId:string){
 return prisma.$transaction(async tx=>{
  const company=await tx.company.findFirst({where:{accountId,deletedAt:null}});
  if(!company)throw new AppError("Không tìm thấy doanh nghiệp","NOT_FOUND",404);
  await tx.$queryRaw`SELECT id FROM company WHERE id=${company.id}::uuid FOR UPDATE`;
  await tx.$queryRaw`SELECT id FROM job_post WHERE id=${jobId}::uuid AND company_id=${company.id}::uuid FOR UPDATE`;
  const now=new Date(),plan=await currentPlan(accountId,tx,now),sub=plan.subscription;
  if(!sub||sub.plan.code!=="company_pro")throw new AppError("Đẩy tin chỉ dành cho gói Pro đang có hiệu lực","PRO_REQUIRED",403);
  const job=await tx.jobPost.findFirst({where:{id:jobId,companyId:company.id,deletedAt:null}});
  if(!job)throw new AppError("Không tìm thấy tin tuyển dụng","NOT_FOUND",404);
  if(job.status!=="PUBLISHED"||(job.deadlineAt&&job.deadlineAt<=now))throw new AppError("Chỉ đẩy tin đang hiển thị và còn hạn","INVALID_STATUS",409);
  if(job.boostedUntil&&job.boostedUntil>now)throw new AppError("Tin đang được đẩy, chưa thể đẩy tiếp","ALREADY_BOOSTED",409);
  await tx.$queryRaw`SELECT id FROM subscriptions WHERE id=${sub.id}::uuid FOR UPDATE`;
  const fresh=await tx.subscription.findUniqueOrThrow({where:{id:sub.id}}),state=fresh.usageState as Record<string,Prisma.JsonValue>;
  const used=Number((state.jobBoostLimit as {used?:number}|undefined)?.used??0),limit=Number(plan.benefits.jobBoostLimit??0);
  if(used>=limit)throw new AppError("Bạn đã hết lượt đẩy tin trong kỳ Pro","BOOST_LIMIT_REACHED",403);
  const boostedUntil=new Date(now.getTime()+48*3600000);
  await tx.jobPost.update({where:{id:job.id},data:{isBoosted:true,boostedUntil}});
  await tx.subscription.update({where:{id:sub.id},data:{usageState:{...state,jobBoostLimit:{used:used+1}}}});
  return {boostedUntil,remaining:limit-used-1};
 });
}
