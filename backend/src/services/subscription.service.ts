import { prisma } from "../utils/prisma";
import type { Prisma } from "../generated/prisma/client";
import { AppError } from "../exceptions";
import { planEntitlements } from "./entitlement.service";

export type Benefits = { cvLimit: number; aiLimit: number; activeJobLimit: number } & Record<string, Prisma.JsonValue>;
export const FREE_BENEFITS: Benefits = { cvLimit: 3, aiLimit: 5, activeJobLimit: 2 };
export const PRO_BENEFITS: Benefits = { cvLimit: 20, aiLimit: 100, activeJobLimit: 10 };
type Db = Prisma.TransactionClient;

export function cvAccess(count: number, limit: number) {
  return { count, limit, editingLocked: count > limit, canCreate: count < limit };
}
export function nextSubscriptionWindow(now: Date, previousEnd: Date | null, durationDays: number) {
  const start = previousEnd && previousEnd > now ? previousEnd : now;
  return { startedAt: start, expiresAt: new Date(start.getTime() + durationDays * 86400000), status: start > now ? "scheduled" as const : "active" as const };
}
export function readBenefits(value: unknown, audience?: string): Benefits {
  const b = value as Partial<Benefits> | null;
  const required = audience === "candidate" ? [b?.cvLimit, b?.aiLimit] : audience === "company" ? [b?.activeJobLimit] : Object.entries(b ?? {}).filter(([k]) => ["cvLimit", "aiLimit", "activeJobLimit"].includes(k)).map(([, v]) => v);
  if (!b || !required.length || !required.every(v => Number.isInteger(v) && Number(v) >= 0))
    throw new AppError("Quyền lợi gói không hợp lệ", "INVALID_PLAN", 409);
  return b as Benefits;
}
export async function currentPlan(accountId: string, db: Db = prisma, now = new Date()) {
  const company = await db.company.findUnique({ where: { accountId }, select: { id: true } });
  const subscription = await db.subscription.findFirst({
    where: { ...(company ? { companyId: company.id } : { accountId }), orderId: { not: null }, status: { in: ["active", "scheduled"] }, startedAt: { lte: now }, expiresAt: { gt: now } },
    orderBy: { expiresAt: "desc" }, include: { plan: { select: { name: true, code: true } }, order: { select: { planSnapshot: true } } },
  });
  const freePlan = subscription ? null : await db.servicePlan.findFirst({ where: { audience: company ? "company" : "candidate", isFree: true, isActive: true, deletedAt: null }, orderBy: { displayOrder: "asc" } });
  const audience = company ? "company" : "candidate";
  const benefits = subscription ? readBenefits((subscription.order!.planSnapshot as { benefits: unknown }).benefits, audience) : freePlan ? readBenefits(await planEntitlements(freePlan.id, db), audience) : readBenefits(company ? { activeJobLimit: 2 } : { cvLimit: 3, aiLimit: 5 }, audience);
  return { subscription, benefits, name: subscription?.plan.name ?? "Free", companyId: company?.id ?? null };
}
export async function candidateAccess(accountId: string, candidateId: string, db: Db = prisma) {
  const plan = await currentPlan(accountId, db);
  const count = await db.cv.count({ where: { candidateId, deletedAt: null } });
  return { ...cvAccess(count, plan.benefits.cvLimit), planName: plan.name };
}
export function assertCvAccess(access: ReturnType<typeof cvAccess>, creating: boolean) {
  if (access.editingLocked) throw new AppError(`Bạn đang có ${access.count}/${access.limit} CV. Vui lòng xóa bớt CV để còn tối đa ${access.limit} CV hoặc nâng cấp Pro để chỉnh sửa.`, "CV_EDITING_LOCKED", 403);
  if (creating && !access.canCreate) throw new AppError(`Gói hiện tại chỉ cho phép ${access.limit} CV. Hãy xóa bớt CV hoặc nâng cấp Pro.`, "CV_LIMIT_REACHED", 403);
}

// Reserve before an external AI call; only successful output consumes a credit.
export async function reserveAi(accountId: string) {
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM accounts WHERE id = ${accountId}::uuid FOR UPDATE`;
    const candidate = await tx.candidate.findUnique({ where: { accountId }, select: { id: true } });
    if (!candidate) throw new AppError("Chỉ ứng viên được sử dụng AI CV", "FORBIDDEN", 403);
    assertCvAccess(await candidateAccess(accountId, candidate.id, tx), false);
    const now = new Date();
    const plan = await currentPlan(accountId, tx, now);
    let subscription = plan.subscription;
    if (!subscription) {
      const free = await tx.servicePlan.findUniqueOrThrow({ where: { code: "candidate_free" } });
      const local = new Date(now.getTime() + 7 * 3600000);
      const startedAt = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - 7 * 3600000);
      const expiresAt = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + 1, 1) - 7 * 3600000);
      const freeSub = await tx.subscription.upsert({ where: { accountId_planId_startedAt: { accountId, planId: free.id, startedAt } }, create: { accountId, planId: free.id, startedAt, expiresAt }, update: {} });
      subscription = { ...freeSub, plan: { name: free.name, code: free.code }, order: null };
    }
    await tx.$queryRaw`SELECT id FROM subscriptions WHERE id = ${subscription.id}::uuid FOR UPDATE`;
    const fresh = await tx.subscription.findUniqueOrThrow({ where: { id: subscription.id } });
    const state = fresh.usageState as Record<string, Prisma.JsonValue>;
    const usage = (state.aiLimit ?? { used: 0, reserved: 0 }) as { used: number; reserved: number };
    if (usage.used + usage.reserved >= plan.benefits.aiLimit) throw new AppError("Bạn đã hết lượt AI trong kỳ sử dụng.", "AI_LIMIT_REACHED", 403);
    await tx.subscription.update({ where: { id: fresh.id }, data: { usageState: { ...state, aiLimit: { ...usage, reserved: usage.reserved + 1 } } as Prisma.InputJsonObject } });
    return fresh.id;
  });
}
export async function finishAi(id: string, success: boolean) {
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM subscriptions WHERE id = ${id}::uuid FOR UPDATE`;
    const subscription = await tx.subscription.findUniqueOrThrow({ where: { id } });
    const state = subscription.usageState as Record<string, Prisma.JsonValue>;
    const usage = state.aiLimit as { used: number; reserved: number };
    if (!usage || usage.reserved <= 0) throw new AppError("Không có lượt AI đang giữ chỗ", "INVALID_RESERVATION", 409);
    await tx.subscription.update({ where: { id }, data: { usageState: { ...state, aiLimit: { used: usage.used + (success ? 1 : 0), reserved: usage.reserved - 1 } } as Prisma.InputJsonObject } });
  });
}
