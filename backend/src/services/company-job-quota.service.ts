import { prisma } from "../utils/prisma";
import { currentPlan } from "./subscription.service";

export async function enforceCompanyJobQuota(companyId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM company WHERE id = ${companyId}::uuid FOR UPDATE`;
    const company = await tx.company.findUniqueOrThrow({
      where: { id: companyId },
    });
    const plan = await currentPlan(company.accountId, tx);
    const jobs = await tx.jobPost.findMany({
      where: {
        companyId,
        deletedAt: null,
        status: { in: ["PUBLISHED", "PENDING"] },
        OR: [{ deadlineAt: null }, { deadlineAt: { gt: new Date() } }],
      },
      orderBy: [
        { publishedAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
        { id: "desc" },
      ],
      select: { id: true },
    });
    const excess = jobs.slice(plan.benefits.activeJobLimit);
    if (excess.length)
      await tx.jobPost.updateMany({
        where: { id: { in: excess.map((job) => job.id) } },
        data: { status: "PAUSED" },
      });
    return {
      company: company.name,
      plan: plan.name,
      limit: plan.benefits.activeJobLimit,
      paused: excess.length,
      active: Math.min(jobs.length, plan.benefits.activeJobLimit),
    };
  });
}

export async function enforceAllCompanyJobQuotas() {
  const companies = await prisma.company.findMany({
    where: { deletedAt: null },
    select: { id: true },
  });
  const results = [];
  for (const company of companies)
    results.push(await enforceCompanyJobQuota(company.id));
  return results;
}
