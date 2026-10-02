import { prisma } from "../utils/prisma";
import type { Prisma } from "../generated/prisma/client";
import { AppError } from "../exceptions";
import { currentPlan } from "./subscription.service";
import uploadService from "./upload.service";

export async function publicCvUsage(accountId: string) {
  const now = new Date();
  const plan = await currentPlan(accountId, prisma, now);
  const subscription = plan.subscription ?? await prisma.subscription.findFirst({ where: { companyId: plan.companyId, orderId: null, status: "active", startedAt: { lte: now }, expiresAt: { gt: now }, plan: { code: "company_free" } } });
  const state = subscription?.usageState as { publicCvViewLimit?: { used: number } } | undefined;
  const used = state?.publicCvViewLimit?.used ?? 0;
  const limit = Number(plan.benefits.publicCvViewLimit);
  return { used, limit, remaining: Math.max(0, limit - used), planName: plan.name };
}

export async function viewPublicCv(accountId: string, candidateId: string, download = uploadService.createDownloadUrl.bind(uploadService)) {
  return prisma.$transaction(async tx => {
    const company = await tx.company.findFirst({ where: { accountId, deletedAt: null, account: { role: "company", status: "active", deletedAt: null } }, select: { id: true } });
    if (!company) throw new AppError("Không có quyền xem CV", "FORBIDDEN", 403);
    // All requests for the company share this lock, including concurrent browser tabs.
    await tx.$queryRaw`SELECT id FROM company WHERE id = ${company.id}::uuid FOR UPDATE`;
    const cv = await tx.cv.findFirst({ where: { candidateId, isDefault: true, deletedAt: null, candidate: { isSearchable: true, deletedAt: null, account: { role: "candidate", status: "active", deletedAt: null } } }, select: { title: true, contentJson: true, fileKey: true } });
    if (!cv || (!cv.fileKey && !cv.contentJson)) throw new AppError("Ứng viên chưa có CV mặc định khả dụng hoặc đã ngừng công khai hồ sơ", "PUBLIC_CV_UNAVAILABLE", 404);
    const applied = await tx.application.findFirst({ where: { candidateId, deletedAt: null, jobPost: { companyId: company.id, deletedAt: null } }, select: { id: true } });
    let subscriptionId: string | null = null;
    let state: Record<string, Prisma.JsonValue> = {};
    let used = 0;
    if (!applied) {
      const now = new Date();
      const plan = await currentPlan(accountId, tx, now);
      let subscription = plan.subscription;
      if (!subscription) {
        const free = await tx.servicePlan.findUniqueOrThrow({ where: { code: "company_free" } });
        const local = new Date(now.getTime() + 7 * 3600000);
        const startedAt = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - 7 * 3600000);
        const expiresAt = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + 1, 1) - 7 * 3600000);
        const row = await tx.subscription.findFirst({ where: { companyId: company.id, planId: free.id, startedAt } })
          ?? await tx.subscription.create({ data: { companyId: company.id, planId: free.id, startedAt, expiresAt } });
        subscription = { ...row, plan: { name: free.name, code: free.code }, order: null };
      }
      subscriptionId = subscription.id;
      await tx.$queryRaw`SELECT id FROM subscriptions WHERE id = ${subscriptionId}::uuid FOR UPDATE`;
      const fresh = await tx.subscription.findUniqueOrThrow({ where: { id: subscriptionId } });
      state = fresh.usageState as Record<string, Prisma.JsonValue>;
      used = Number((state.publicCvViewLimit as { used?: number } | undefined)?.used ?? 0);
      const limit = Number(plan.benefits.publicCvViewLimit);
      if (!Number.isInteger(limit) || limit < 0) throw new AppError("Hạn mức xem CV chưa được cấu hình", "INVALID_PLAN", 409);
      if (used >= limit) throw new AppError(`Bạn đã dùng hết ${limit} lượt xem CV công khai trong kỳ. CV của ứng viên đã ứng tuyển vẫn được xem miễn phí.`, "PUBLIC_CV_LIMIT_REACHED", 403);
    }
    const url = cv.fileKey ? await download(cv.fileKey, accountId, candidateId) : null;
    // URL creation errors roll back the counter; each successful request consumes one view.
    if (subscriptionId) await tx.subscription.update({ where: { id: subscriptionId }, data: { usageState: { ...state, publicCvViewLimit: { used: used + 1 } } as Prisma.InputJsonObject } });
    return { title: cv.title, content: cv.contentJson, url, charged: !applied };
  }, { timeout: 15000 });
}
