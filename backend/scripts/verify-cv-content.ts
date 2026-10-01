import "dotenv/config";
import assert from "node:assert/strict";
import { prisma } from "../src/utils/prisma";
import cvService from "../src/services/cv.service";
import { cvFormSchema } from "../../frontend/src/validators/cv.validate";

async function main() {
  const rows = await prisma.cv.findMany({where:{deletedAt:null},include:{candidate:true}});
  for(const cv of rows) {
    const detail = await cvService.detail(cv.candidate.accountId,cv.id);
    const {theme,...content}=detail.contentJson as any;
    cvFormSchema.parse({title:detail.title,templateCode:detail.templateCode,theme,data:{...content,personal:{...content.personal,avatar:detail.avatarUrl}}});
    const list = await cvService.list(cv.candidate.accountId);
    assert.equal(list.find(row=>row.id===cv.id)?.isEditable,true);
  }
  const first=rows[0]!;
  const other=rows.find(row=>row.candidateId!==first.candidateId)!;
  await assert.rejects(()=>cvService.detail(other.candidate.accountId,first.id),/Không tìm thấy CV/);
  console.log(`${rows.length} CVs load through the service, validate against the frontend form, and appear as editable; cross-account access rejected.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>prisma.$disconnect());
