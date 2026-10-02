import "dotenv/config";
import { prisma } from "../src/utils/prisma";
import { currentPlan, nextSubscriptionWindow } from "../src/services/subscription.service";
import { planEntitlements } from "../src/services/entitlement.service";
import { enforceAllCompanyJobQuotas } from "../src/services/company-job-quota.service";

async function main() {
  const matches = await prisma.company.findMany({ where: { name: { equals: "Công ty F88", mode: "insensitive" }, deletedAt: null } });
  if (matches.length !== 1) throw new Error(`Expected one F88 company, found ${matches.length}`);
  const company = matches[0]!;
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM company WHERE id = ${company.id}::uuid FOR UPDATE`;
    const current = await currentPlan(company.accountId, tx);
    if (current.subscription) return;
    const plan = await tx.servicePlan.findUniqueOrThrow({ where: { code: "company_pro" } });
    const now = new Date();
    const key = `admin-grant:f88-pro:${company.id}`;
    const existing = await tx.order.findUnique({ where: { requestKey: key } });
    if (existing) return;
    const order = await tx.order.create({ data: { code: `GRANT-${company.id}`, requestKey: key, purchasedByAccountId: company.accountId, planId: plan.id, totalAmount: 0, status: "paid", paidAt: now, metadata: { source: "admin_grant", reason: "User requested complimentary Pro for F88; no payment collected" }, planSnapshot: { name: plan.name, audience: "company", companyId: company.id, durationDays: 30, benefits: await planEntitlements(plan.id, tx) } } });
    await tx.subscription.create({ data: { companyId: company.id, orderId: order.id, planId: plan.id, ...nextSubscriptionWindow(now, null, 30) } });
  });
  const results = await enforceAllCompanyJobQuotas();
  console.log(JSON.stringify({ f88: results.find(r => r.company === company.name), companies: results.length, pausedTotal: results.reduce((sum, r) => sum + r.paused, 0) }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
