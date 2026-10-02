import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "../utils/prisma";
import { viewPublicCv, publicCvUsage } from "../services/public-cv.service";

test("public CV views count repeats, enforce concurrent limits and exempt applicants", async () => {
  const employer = await prisma.account.create({ data: { email: `cv-employer-${randomUUID()}@example.invalid`, passwordHash: "test", role: "company", company: { create: { name: "CV quota test", code: randomUUID() } } }, include: { company: true } });
  const candidate = await prisma.account.create({ data: { email: `cv-candidate-${randomUUID()}@example.invalid`, passwordHash: "test", role: "candidate", candidate: { create: { fullName: "Test", isSearchable: true } } }, include: { candidate: true } });
  const cv = await prisma.cv.create({ data: { candidateId: candidate.candidate!.id, title: "CV test", isDefault: true, contentJson: { personal: { fullName: "Test" } } } });
  let jobId: string | null = null;
  let orderId: string | null = null;
  try {
    const id = candidate.candidate!.id;
    await viewPublicCv(employer.id, id);
    await viewPublicCv(employer.id, id);
    assert.equal((await publicCvUsage(employer.id)).used, 2);
    await prisma.cv.update({ where: { id: cv.id }, data: { fileKey: "test.pdf" } });
    await assert.rejects(viewPublicCv(employer.id, id, async () => { throw new Error("URL failure"); }));
    assert.equal((await publicCvUsage(employer.id)).used, 2);
    await prisma.cv.update({ where: { id: cv.id }, data: { fileKey: null } });
    await prisma.candidate.update({ where: { id }, data: { isSearchable: false } });
    await assert.rejects(viewPublicCv(employer.id, id), { code: "PUBLIC_CV_UNAVAILABLE" });
    await prisma.candidate.update({ where: { id }, data: { isSearchable: true } });
    const attempts = await Promise.allSettled(Array.from({ length: 12 }, () => viewPublicCv(employer.id, id)));
    assert.equal(attempts.filter(a => a.status === "fulfilled").length, 8);
    assert.equal((await publicCvUsage(employer.id)).remaining, 0);
    await assert.rejects(viewPublicCv(employer.id, id), { code: "PUBLIC_CV_LIMIT_REACHED" });
    const ward = await prisma.ward.findFirstOrThrow();
    const category = await prisma.jobCategory.findFirstOrThrow();
    const job = await prisma.jobPost.create({ data: { companyId: employer.company!.id, title: "Test", address: "Test", wardId: ward.id, provinceId: ward.provinceId, jobCategoryId: category.id } });
    jobId = job.id;
    await prisma.application.create({ data: { candidateId: id, jobPostId: job.id, cvId: cv.id } });
    assert.equal((await viewPublicCv(employer.id, id)).charged, false);
    assert.equal((await publicCvUsage(employer.id)).used, 10);
    await prisma.application.deleteMany({ where: { jobPostId: job.id } });
    const plan = await prisma.servicePlan.findUniqueOrThrow({ where: { code: "company_pro" } });
    const order = await prisma.order.create({ data: { code: `test-${randomUUID()}`, purchasedByAccountId: employer.id, planId: plan.id, totalAmount: 0, status: "paid", requestKey: randomUUID(), planSnapshot: { benefits: { activeJobLimit: 10, publicCvViewLimit: 100 } } } });
    orderId = order.id;
    const sub = await prisma.subscription.create({ data: { orderId: order.id, companyId: employer.company!.id, planId: plan.id, startedAt: new Date(Date.now() - 1000), expiresAt: new Date(Date.now() + 86400000), usageState: { publicCvViewLimit: { used: 99 } } } });
    const pro = await Promise.allSettled([viewPublicCv(employer.id, id), viewPublicCv(employer.id, id)]);
    assert.equal(pro.filter(a => a.status === "fulfilled").length, 1);
    assert.equal((await publicCvUsage(employer.id)).limit, 100);
    await prisma.subscription.update({ where: { id: sub.id }, data: { expiresAt: new Date(Date.now() - 1) } });
    assert.equal((await publicCvUsage(employer.id)).used, 10);
    await assert.rejects(viewPublicCv(employer.id, id), { code: "PUBLIC_CV_LIMIT_REACHED" });
  } finally {
    await prisma.subscription.deleteMany({ where: { companyId: employer.company!.id } });
    if (orderId) await prisma.order.delete({ where: { id: orderId } });
    if (jobId) { await prisma.application.deleteMany({ where: { jobPostId: jobId } }); await prisma.jobPost.delete({ where: { id: jobId } }); }
    await prisma.cv.delete({ where: { id: cv.id } });
    await prisma.candidate.delete({ where: { id: candidate.candidate!.id } });
    await prisma.company.delete({ where: { id: employer.company!.id } });
    await prisma.account.deleteMany({ where: { id: { in: [candidate.id, employer.id] } } });
    await prisma.$disconnect();
  }
});
