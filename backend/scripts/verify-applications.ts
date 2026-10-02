import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "../src/utils/prisma";
import { ApplicationService } from "../src/services/application.service";
import { cvDataSchema } from "../src/validators/cv.validate";
import jwtService from "../src/services/jwt.service";
async function main() {
  const candidates = await prisma.candidate.findMany({where:{deletedAt:null,account:{role:"candidate",status:"active",deletedAt:null}},include:{cvs:{where:{deletedAt:null}}},take:100});
  const candidate = candidates.find(c=>c.cvs.some(cv=>cv.fileKey||cvDataSchema.safeParse(cv.contentJson).success));
  assert.ok(candidate);
  const cv = candidate.cvs.find(cv=>cv.fileKey||cvDataSchema.safeParse(cv.contentJson).success)!;
  const job = await prisma.jobPost.findFirst({where:{status:"PUBLISHED",deletedAt:null,OR:[{deadlineAt:null},{deadlineAt:{gte:new Date()}}],company:{deletedAt:null,account:{status:"active",deletedAt:null}}}});
  assert.ok(job);
  const before = await prisma.application.count({where:{candidateId:candidate.id,jobPostId:job.id}});
  const rollback = new Error("ROLLBACK_APPLICATION_TEST");
  try {
    await prisma.$transaction(async tx=>{
      const db = new Proxy(tx,{get(target,key){return key==="$transaction" ? (callback:any)=>callback(tx) : Reflect.get(target,key);}}) as unknown as typeof prisma;
      const service = new ApplicationService(db);
      await tx.application.deleteMany({where:{candidateId:candidate.id,jobPostId:job.id}});
      const input = {jobPostId:job.id,cvId:cv.id,coverLetter:"Tôi mong muốn ứng tuyển vị trí này."};
      await assert.rejects(()=>service.create(randomUUID(),input),(e:any)=>e.status===403);
      await assert.rejects(()=>service.create(candidate.accountId,{...input,cvId:randomUUID()}),(e:any)=>e.code==="INVALID_CV");
      await tx.cv.update({where:{id:cv.id},data:{deletedAt:new Date()}});
      await assert.rejects(()=>service.create(candidate.accountId,input),(e:any)=>e.code==="INVALID_CV");
      await tx.cv.update({where:{id:cv.id},data:{deletedAt:null}});
      const created=await service.create(candidate.accountId,input);
      assert.equal(created.status,"submitted"); assert.equal(created.cvId,cv.id);
      assert.equal((await service.status(candidate.accountId,job.id))?.id,created.id);
      await assert.rejects(()=>service.create(candidate.accountId,input),(e:any)=>e.code==="ALREADY_APPLIED");
      await tx.application.delete({where:{id:created.id}});
      await tx.jobPost.update({where:{id:job.id},data:{deadlineAt:new Date("2000-01-01")}});
      await assert.rejects(()=>service.create(candidate.accountId,input),(e:any)=>e.code==="JOB_UNAVAILABLE");
      throw rollback;
    },{timeout:20000});
  } catch(error){if(error!==rollback)throw error;}
  assert.equal(await prisma.application.count({where:{candidateId:candidate.id,jobPostId:job.id}}),before);
  if (process.argv.includes("--http")) {
    const headers = {Authorization:`Bearer ${jwtService.createAccessToken(candidate.accountId,"candidate")}`,"Content-Type":"application/json"};
    const response = await fetch(`http://localhost:3100/application/job/${job.id}`,{headers});
    assert.equal(response.status,200);
    assert.equal((await response.json()).success,true);
    const invalid = await fetch("http://localhost:3100/application",{method:"POST",headers,body:JSON.stringify({jobPostId:job.id,cvId:"invalid"})});
    assert.equal(invalid.status,400);
    const unauth = await fetch(`http://localhost:3100/application/job/${job.id}`);
    assert.equal(unauth.status,401);
    console.log("Live application API passed: status, validation, authentication.");
  }
  console.log("Applications passed: submission, status, duplicate, ownership, deleted CV, expired job; transaction rolled back.");
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>prisma.$disconnect());
