import assert from "node:assert/strict";
import { prisma } from "../src/utils/prisma";
import { CvService } from "../src/services/cv.service";
import { cvSaveSchema } from "../src/validators/cv.validate";

async function main() {
  const rollback = new Error("ROLLBACK_VERIFICATION");
  try {
    await prisma.$transaction(async tx => {
      const cv = await tx.cv.findFirstOrThrow({where:{deletedAt:null,isDefault:true,candidate:{deletedAt:null,account:{status:"active",deletedAt:null}}},include:{candidate:true}});
      const other = await tx.candidate.findFirstOrThrow({where:{id:{not:cv.candidateId},deletedAt:null,account:{status:"active",deletedAt:null}}});
      const db={candidate:tx.candidate,cv:tx.cv,$transaction:async(fn:(client:typeof tx)=>Promise<unknown>)=>fn(tx)} as unknown as typeof prisma;
      const service=new CvService(db);
      const before=await tx.application.count({where:{cvId:cv.id}});
      await assert.rejects(()=>service.remove(other.accountId,cv.id),/Không tìm thấy CV/);
      assert.equal((await tx.cv.findUniqueOrThrow({where:{id:cv.id}})).deletedAt,null);
      await service.remove(cv.candidate.accountId,cv.id);
      const deleted=await tx.cv.findUniqueOrThrow({where:{id:cv.id}});
      assert.ok(deleted.deletedAt instanceof Date);
      assert.equal(deleted.isDefault,false);
      assert.equal(deleted.candidateId,cv.candidateId);
      assert.deepEqual(deleted.contentJson,cv.contentJson);
      assert.equal(deleted.fileKey,cv.fileKey);
      assert.equal(await tx.application.count({where:{cvId:cv.id}}),before);
      assert.equal((await service.list(cv.candidate.accountId)).some(row=>row.id===cv.id),false);
      await assert.rejects(()=>service.detail(cv.candidate.accountId,cv.id),/Không tìm thấy CV/);
      await assert.rejects(()=>service.remove(cv.candidate.accountId,cv.id),/Không tìm thấy CV/);
      const input=cvSaveSchema.parse({title:cv.title,templateCode:cv.templateCode,contentJson:cv.contentJson});
      input.contentJson.personal.avatarKey="";
      await assert.rejects(()=>service.save(cv.candidate.accountId,input,cv.id),/Không tìm thấy CV/);
      await assert.rejects(()=>service.create(cv.candidate.accountId,{...input,id:cv.id}),/Không tìm thấy CV/);
      throw rollback;
    },{timeout:15000});
  } catch(error) {
    if(error!==rollback) throw error;
  }
  console.log("Passed: ownership, soft deletion, hidden list/detail, default flag cleared, relations preserved, deleted CV cannot be saved or recreated. Transaction rolled back.");
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>prisma.$disconnect());
