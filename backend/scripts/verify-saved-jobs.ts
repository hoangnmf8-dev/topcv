import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "../src/utils/prisma";
import { SavedJobService } from "../src/services/saved-job.service";
async function main() {
  const candidate = await prisma.candidate.findFirst({ where: { deletedAt: null, account: { status: "active", deletedAt: null, role: "candidate" } }, select: { id: true, accountId: true } });
  const job = await prisma.jobPost.findFirst({ where: { status: "PUBLISHED", deletedAt: null, company: { deletedAt: null, account: { status: "active", deletedAt: null } } }, select: { id: true } });
  assert.ok(candidate); assert.ok(job);
  const service = new SavedJobService();
  const before = (await service.list(candidate.accountId)).sort();
  const rollback = new Error("ROLLBACK_SAVED_JOB_TEST");
  try {
    await prisma.$transaction(async tx => {
      const service = new SavedJobService(tx as unknown as typeof prisma);
      await service.remove(candidate.accountId, job.id);
      await service.save(candidate.accountId, job.id);
      await service.save(candidate.accountId, job.id);
      assert.equal((await service.list(candidate.accountId)).filter(id => id === job.id).length, 1);
      await assert.rejects(() => service.save(randomUUID(), job.id), (e: any) => e.status === 403);
      await assert.rejects(() => service.save(candidate.accountId, randomUUID()), (e: any) => e.status === 404);
      await service.remove(candidate.accountId, job.id);
      await service.remove(candidate.accountId, job.id);
      assert.equal((await service.list(candidate.accountId)).includes(job.id), false);
      throw rollback;
    }, { timeout: 20000 });
  } catch (error) { if (error !== rollback) throw error; }
  assert.deepEqual((await service.list(candidate.accountId)).sort(), before);
  console.log("Saved jobs passed: persisted list, idempotent save/remove, ownership, unavailable job; transaction rolled back.");
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
