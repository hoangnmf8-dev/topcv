import "dotenv/config";
import {test} from "node:test";
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {prisma} from "../utils/prisma";
import {boostJob,jobBoostUsage} from "../services/job-boost.service";
import jobPostService from "../services/job-post.service";

test("Pro boost consumes quota once, expires and enforces ownership and limit",async()=>{
 const account=await prisma.account.create({data:{email:`boost-${randomUUID()}@example.invalid`,passwordHash:"test",role:"company",company:{create:{name:"Boost fixture",code:randomUUID()}}},include:{company:true}});
 const plan=await prisma.servicePlan.findUniqueOrThrow({where:{code:"company_pro"}}),ward=await prisma.ward.findFirstOrThrow(),category=await prisma.jobCategory.findFirstOrThrow();
 const job=await prisma.jobPost.create({data:{companyId:account.company!.id,title:"Boost fixture",address:"test",provinceId:ward.provinceId,wardId:ward.id,jobCategoryId:category.id,status:"PUBLISHED",deadlineAt:new Date(Date.now()+7*86400000)}});
 let orderId:string|undefined;
 try{
  await assert.rejects(()=>boostJob(account.id,job.id),/Pro/);
  const order=await prisma.order.create({data:{code:randomUUID(),purchasedByAccountId:account.id,planId:plan.id,totalAmount:200000,status:"paid",planSnapshot:{benefits:{activeJobLimit:10,jobBoostLimit:20}}}});orderId=order.id;
  const sub=await prisma.subscription.create({data:{orderId:order.id,companyId:account.company!.id,planId:plan.id,startedAt:new Date(Date.now()-1000),expiresAt:new Date(Date.now()+30*86400000)}});
  const results=await Promise.allSettled([boostJob(account.id,job.id),boostJob(account.id,job.id)]);
  assert.equal(results.filter(r=>r.status==="fulfilled").length,1);
  assert.equal((await jobBoostUsage(account.id)).used,1);
  const boosted=await prisma.jobPost.findUniqueOrThrow({where:{id:job.id}});
  assert.ok(boosted.boostedUntil!.getTime()-Date.now()>47.9*3600000);
  await assert.rejects(()=>boostJob(account.id,randomUUID()),/Không tìm thấy/);
  await prisma.jobPost.update({where:{id:job.id},data:{boostedUntil:new Date(Date.now()-1000)}});
  assert.equal((await jobPostService.getJobPost(job.id)).isBoosted,false);
  await prisma.subscription.update({where:{id:sub.id},data:{usageState:{jobBoostLimit:{used:20}}}});
  await assert.rejects(()=>boostJob(account.id,job.id),/hết lượt/);
 }finally{
  await prisma.jobPost.delete({where:{id:job.id}});
  await prisma.subscription.deleteMany({where:{companyId:account.company!.id}});
  if(orderId)await prisma.order.delete({where:{id:orderId}});
  await prisma.company.delete({where:{id:account.company!.id}});
  await prisma.account.delete({where:{id:account.id}});
  await prisma.$disconnect();
 }
});
