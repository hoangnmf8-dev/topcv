import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "../utils/prisma";
import { expireJobPosts, JOB_EXPIRATION_SCHEDULE } from "../services/job-expiration.service";

test("expiration handles deadline boundaries and preserves closed, rejected, deleted and undated posts", async () => {
  const rollback = new Error("Rollback test fixtures");
  try {
    await assert.rejects(prisma.$transaction(async tx => {
      const account = await tx.account.create({ data: { email: `expiration-${randomUUID()}@example.invalid`, role: "company", passwordHash: "test", company: { create: { name: "Expiration test", code: randomUUID() } } }, include: { company: true } });
      const ward = await tx.ward.findFirstOrThrow();
      const category = await tx.jobCategory.findFirstOrThrow();
      const now = new Date();
      const base = { companyId: account.company!.id, title: "Expiration fixture", address: "Test", wardId: ward.id, provinceId: ward.provinceId, jobCategoryId: category.id };
      const cases = [
        { status: "PUBLISHED" as const, deadlineAt: new Date(now.getTime() - 1), expected: "EXPIRED" },
        { status: "PENDING" as const, deadlineAt: now, expected: "EXPIRED" },
        { status: "PAUSED" as const, deadlineAt: now, expected: "EXPIRED" },
        { status: "PUBLISHED" as const, deadlineAt: new Date(now.getTime() + 60000), expected: "PUBLISHED" },
        { status: "PUBLISHED" as const, deadlineAt: null, expected: "PUBLISHED" },
        { status: "CLOSED" as const, deadlineAt: now, expected: "CLOSED" },
        { status: "REJECTED" as const, deadlineAt: now, expected: "REJECTED" },
        { status: "PUBLISHED" as const, deadlineAt: now, deletedAt: now, expected: "PUBLISHED" },
      ];
      const rows = [];
      for (const { expected, ...data } of cases) rows.push(await tx.jobPost.create({ data: { ...base, ...data } }));
      await expireJobPosts(now, tx);
      for (let i = 0; i < rows.length; i++) assert.equal((await tx.jobPost.findUniqueOrThrow({ where: { id: rows[i]!.id } })).status, cases[i]!.expected);
      assert.equal((await expireJobPosts(now, tx)).count, 0);
      assert.deepEqual(JOB_EXPIRATION_SCHEDULE, { pattern: "0 2 * * *", tz: "Asia/Ho_Chi_Minh" });
      throw rollback;
    }, { timeout: 15000 }), error => error === rollback);
  } finally { await prisma.$disconnect(); }
});
