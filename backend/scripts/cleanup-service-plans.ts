import "dotenv/config";
import { prisma } from "../src/utils/prisma";

const codes = ["candidate_free", "candidate_pro", "candidate_premium", "company_free", "company_pro", "company_premium"];
async function main() {
  const plans = await prisma.servicePlan.findMany({ include: { _count: { select: { orders: true, subscriptions: true } } } });
  console.log(JSON.stringify(plans.map(p => ({ code: p.code, audience: p.audience, references: p._count }))));
  if (!process.argv.includes("--apply")) return;
  await prisma.$transaction(async tx => {
    for (const code of codes) {
      const plan = plans.find(p => p.code === code);
      if (!plan || plan.deletedAt) throw new Error(`Missing canonical plan: ${code}`);
    }
    for (const plan of plans.filter(p => !codes.includes(p.code))) {
      if (!["TOPCV-PRO-30", "RECRUITMENT-30"].includes(plan.code)) throw new Error(`Unknown extra plan: ${plan.code}`);
      const target = plans.find(p => p.code === `${plan.audience}_pro`)!;
      await tx.order.updateMany({ where: { planId: plan.id }, data: { planId: target.id } });
      await tx.subscription.updateMany({ where: { planId: plan.id }, data: { planId: target.id } });
      await tx.servicePlan.delete({ where: { id: plan.id } });
    }
  });
  console.log(JSON.stringify({ remaining: await prisma.servicePlan.count() }));
}
main().finally(() => prisma.$disconnect());
