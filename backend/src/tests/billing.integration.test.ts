import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "../utils/prisma";
import cvService from "../services/cv.service";
import uploadService from "../services/upload.service";
import { r2Client } from "../utils/upload";
import { candidateAccess, currentPlan, reserveAi, finishAi, PRO_BENEFITS } from "../services/subscription.service";
import { settlePayment, createOrder } from "../services/billing.service";
import { payos } from "../services/payos.service";
import { cvCreateSchema } from "../validators/cv.validate";
import { planEntitlements } from "../services/entitlement.service";

test("billing and CV lifecycle with isolated database fixtures", async t => {
  const account = await prisma.account.create({ data: { email: `billing-test-${randomUUID()}@example.invalid`, passwordHash: "test", role: "candidate", candidate: { create: { fullName: "Test" } } }, include: { candidate: true } });
  const candidateId = account.candidate!.id;
  const plan = await prisma.servicePlan.create({ data: { code: `test_${randomUUID()}`, name: "Pro test", audience: "candidate", price: 10000, durationDays: 30, metadata: { benefits: PRO_BENEFITS } } });
  for (const [code, value] of Object.entries(PRO_BENEFITS)) {
    if (code === "activeJobLimit") continue;
    const entitlement = await prisma.entitlement.findUniqueOrThrow({ where: { code } });
    await prisma.planEntitlement.create({ data: { planId: plan.id, entitlementId: entitlement.id, value: value as number } });
  }
  const extra = await prisma.entitlement.create({ data: { code: `test_feature_${randomUUID()}`, name: "Test feature", valueType: "boolean" } });
  await prisma.planEntitlement.create({ data: { planId: plan.id, entitlementId: extra.id, value: true } });
  const originalSend = r2Client.send;
  const envNames = ["PAYOS_CLIENT_ID", "PAYOS_API_KEY", "PAYOS_CHECKSUM_KEY", "PAYMENT_RETURN_URL"];
  const oldEnv = envNames.map(k => process.env[k]);
  envNames.forEach(k => process.env[k] = k === "PAYMENT_RETURN_URL" ? "http://localhost:3000/billing/orders" : "test-only");
  const input = () => cvCreateSchema.parse({ id: randomUUID(), title: "Test CV", templateCode: "modern", isDefault: false, contentJson: { theme: "emerald", personal: { fullName: "Test", title: "Developer", phone: "0901234567", email: "test@example.com", address: "", github: "", linkedin: "" }, objective: "", experiences: [], educations: [], skills: [] } });
  try {
    await t.test("typed entitlements support new features and reject invalid values", async () => {
      assert.equal((await planEntitlements(plan.id))[extra.code], true);
      await prisma.planEntitlement.update({ where: { planId_entitlementId: { planId: plan.id, entitlementId: extra.id } }, data: { value: "invalid" } });
      await assert.rejects(planEntitlements(plan.id), { code: "INVALID_PLAN" });
      await prisma.planEntitlement.update({ where: { planId_entitlementId: { planId: plan.id, entitlementId: extra.id } }, data: { value: true } });
    });
    await t.test("concurrent first CV creation chooses one default and enforces Free limit", async () => {
      await Promise.all([cvService.create(account.id, input()), cvService.create(account.id, input())]);
      assert.equal(await prisma.cv.count({ where: { candidateId, isDefault: true, deletedAt: null } }), 1);
      const attempts = await Promise.allSettled([cvService.create(account.id, input()), cvService.create(account.id, input())]);
      assert.equal(attempts.filter(a => a.status === "fulfilled").length, 1);
      assert.equal(await prisma.cv.count({ where: { candidateId, deletedAt: null } }), 3);
    });
    await t.test("first PDF is default with explicit false; retry does not duplicate", async () => {
      for (const row of await cvService.list(account.id)) await cvService.remove(account.id, row.id);
      r2Client.send = (async (command: { constructor: { name: string } }) => command.constructor.name === "HeadObjectCommand" ? { ContentType: "application/pdf", ContentLength: 100 } : { Body: { transformToByteArray: async () => Buffer.from("%PDF-") } }) as typeof r2Client.send;
      const upload = { objectKey: `seed/topcv/candidates/${account.id}/cv-01900000-0000-7000-8000-000000000001.pdf`, title: "Uploaded", isDefault: false };
      const cv = await uploadService.completeCvUpload(account.id, upload);
      assert.equal(cv.isDefault, true);
      const retried = await uploadService.completeCvUpload(account.id, upload);
      assert.equal(retried.id, cv.id);
      assert.equal(retried.isDefault, true);
      assert.equal(await prisma.cv.count({ where: { candidateId, deletedAt: null } }), 1);
    });
    await t.test("Premium unavailable; invalid webhook signature rejected", async () => {
      await prisma.servicePlan.update({ where: { id: plan.id }, data: { availability: "coming_soon" } });
      await assert.rejects(createOrder(account.id, "candidate", plan.id, randomUUID()), { code: "PLAN_UNAVAILABLE" });
      await prisma.servicePlan.update({ where: { id: plan.id }, data: { availability: "available" } });
      await assert.rejects(payos().webhooks.verify({ code: "00", desc: "success", success: true, data: {} as never, signature: "invalid" }));
    });
    await t.test("order retry, wrong amount, duplicate confirmation and queued renewal", async () => {
      const request = randomUUID();
      const order = await createOrder(account.id, "candidate", plan.id, request);
      assert.equal((order.planSnapshot as Record<string, any>).benefits[extra.code], true);
      const cvEntitlement = await prisma.entitlement.findUniqueOrThrow({ where: { code: "cvLimit" } });
      await prisma.planEntitlement.update({ where: { planId_entitlementId: { planId: plan.id, entitlementId: cvEntitlement.id } }, data: { value: 99 } });
      assert.equal((await createOrder(account.id, "candidate", plan.id, request)).id, order.id);
      const payment = await prisma.payment.create({ data: { orderId: order.id, provider: "payos", amount: 10000 } });
      await assert.rejects(settlePayment(Number(payment.providerOrderCode), "test-ref-1", 9999, {}), { code: "PAYMENT_MISMATCH" });
      assert.equal(await prisma.subscription.count({ where: { orderId: order.id } }), 0);
      await Promise.all([settlePayment(Number(payment.providerOrderCode), "test-ref-1", 10000, {}), settlePayment(Number(payment.providerOrderCode), "test-ref-1", 10000, {})]);
      assert.equal(await prisma.subscription.count({ where: { orderId: order.id } }), 1);
      assert.equal(await prisma.notification.count({ where: { eventKey: `order:${order.id}:paid` } }), 1);
      assert.equal((await currentPlan(account.id)).benefits.cvLimit, 20);
      assert.equal((await currentPlan(account.id)).benefits.activeJobLimit, undefined);
      assert.equal((await currentPlan(account.id)).benefits[extra.code], true);
      await prisma.planEntitlement.update({ where: { planId_entitlementId: { planId: plan.id, entitlementId: cvEntitlement.id } }, data: { value: 20 } });
      const next = await createOrder(account.id, "candidate", plan.id, randomUUID());
      const secondPayment = await prisma.payment.create({ data: { orderId: next.id, provider: "payos", amount: 10000 } });
      await settlePayment(Number(secondPayment.providerOrderCode), "test-ref-2", 10000, {});
      const firstSub = await prisma.subscription.findUniqueOrThrow({ where: { orderId: order.id } });
      const secondSub = await prisma.subscription.findUniqueOrThrow({ where: { orderId: next.id } });
      assert.equal(secondSub.startedAt.getTime(), firstSub.expiresAt.getTime());
      assert.equal(secondSub.status, "scheduled");
    });
    await t.test("expired Pro locks all CVs; deleting to Free limit unlocks editing", async () => {
      await Promise.all([cvService.create(account.id, input()), cvService.create(account.id, input()), cvService.create(account.id, input())]);
      const now = Date.now();
      const subscriptions = await prisma.subscription.findMany({ where: { accountId: account.id } });
      for (const [index, subscription] of subscriptions.entries()) await prisma.subscription.update({ where: { id: subscription.id }, data: { startedAt: new Date(now - (32 + index) * 86400000), expiresAt: new Date(now - 86400000) } });
      const rows = await cvService.list(account.id);
      assert.equal((await candidateAccess(account.id, candidateId)).editingLocked, true);
      const editable = rows.find(c => c.isEditable)!;
      const { id: ignoredId, ...saveInput } = input();
      await assert.rejects(cvService.save(account.id, saveInput, editable.id), { code: "CV_EDITING_LOCKED" });
      await assert.rejects(reserveAi(account.id), { code: "CV_EDITING_LOCKED" });
      await cvService.remove(account.id, rows[0]!.id);
      assert.equal((await candidateAccess(account.id, candidateId)).editingLocked, false);
      const remaining = (await cvService.list(account.id)).find(c => c.isEditable)!;
      await cvService.save(account.id, saveInput, remaining.id);
    });
    await t.test("AI failures release credit and concurrent requests enforce Free quota", async () => {
      await finishAi(await reserveAi(account.id), false);
      const requests = await Promise.allSettled(Array.from({ length: 6 }, () => reserveAi(account.id)));
      assert.equal(requests.filter(r => r.status === "fulfilled").length, 5);
      for (const request of requests) if (request.status === "fulfilled") await finishAi(request.value, true);
      await assert.rejects(reserveAi(account.id), { code: "AI_LIMIT_REACHED" });
      const freeSub = await prisma.subscription.findFirstOrThrow({ where: { accountId: account.id, orderId: null } });
      assert.deepEqual(freeSub.usageState, { aiLimit: { used: 5, reserved: 0 } });
      await assert.rejects(finishAi(freeSub.id, true), { code: "INVALID_RESERVATION" });
    });
  } finally {
    r2Client.send = originalSend;
    envNames.forEach((k, i) => { const previous = oldEnv[i]; if (previous === undefined) delete process.env[k]; else process.env[k] = previous; });
    await prisma.paymentEvent.deleteMany({ where: { payment: { order: { purchasedByAccountId: account.id } } } });
    await prisma.subscription.deleteMany({ where: { accountId: account.id } });
    await prisma.payment.deleteMany({ where: { order: { purchasedByAccountId: account.id } } });
    await prisma.order.deleteMany({ where: { purchasedByAccountId: account.id } });
    await prisma.cv.deleteMany({ where: { candidateId } });
    await prisma.account.delete({ where: { id: account.id } });
    await prisma.servicePlan.delete({ where: { id: plan.id } });
    await prisma.entitlement.delete({ where: { id: extra.id } });
    await prisma.$disconnect();
  }
});
