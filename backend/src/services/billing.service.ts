import { randomUUID } from "node:crypto";
import { notify } from "./notification.service";
import { prisma } from "../utils/prisma";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../exceptions";
import { payos, paymentsConfigured } from "./payos.service";
import { planEntitlements } from "./entitlement.service";
import {
  FREE_BENEFITS,
  PRO_BENEFITS,
  currentPlan,
  nextSubscriptionWindow,
  readBenefits,
} from "./subscription.service";

export async function syncPlans() {
  for (const [code, name] of [["cvLimit", "Số CV tối đa"], ["aiLimit", "Lượt AI trong kỳ"], ["activeJobLimit", "Số tin tuyển dụng hoạt động"], ["publicCvViewLimit", "Lượt xem CV công khai trong kỳ"], ["jobBoostLimit", "Lượt đẩy tin trong 30 ngày"]] as const) {
    await prisma.entitlement.upsert({ where: { code }, create: { code, name, valueType: "number" }, update: {} });
  }
  const descriptions = { candidate: { jobFeatures: "Tìm việc, lưu việc, ứng tuyển và nhắn tin", cvFeatures: "Tạo CV từ các mẫu hiện có và xuất PDF" }, company: { applicationFeatures: "Nhận và quản lý hồ sơ ứng tuyển", candidateCvFeatures: "Xem CV của ứng viên đã ứng tuyển", recruitmentFeatures: "Nhắn tin và dashboard tuyển dụng" } };
  for (const values of Object.values(descriptions)) for (const [code, name] of Object.entries(values)) await prisma.entitlement.upsert({ where: { code }, create: { code, name, valueType: "string" }, update: {} });
  for (const audience of ["candidate", "company"] as const) {
    for (const tier of ["free", "pro", "premium"] as const) {
      const data = {
        name: tier === "free" ? "Free" : tier === "pro" ? "Pro" : "Premium",
        audience,
        currency: "VND",
        durationDays: tier === "free" ? null : 30,
        isFree: tier === "free",
        availability:
          tier === "premium"
            ? ("coming_soon" as const)
            : ("available" as const),
        metadata: {
          tier,
        },
        displayOrder: tier === "free" ? 0 : tier === "pro" ? 1 : 2,
      };
      const plan = await prisma.servicePlan.upsert({
        where: { code: `${audience}_${tier}` },
        // Prices are managed in the database; new plans start unavailable to buy.
        create: { code: `${audience}_${tier}`, ...data, price: 0 },
        update: data,
      });
      const limits = tier === "free" ? FREE_BENEFITS : PRO_BENEFITS;
      const scoped = audience === "candidate" ? { cvLimit: limits.cvLimit, aiLimit: limits.aiLimit } : { activeJobLimit: limits.activeJobLimit, publicCvViewLimit: tier === "free" ? 10 : 100, jobBoostLimit: tier === "pro" ? 20 : 0 };
      for (const [code, value] of Object.entries({ ...scoped, ...descriptions[audience] })) {
        const entitlement = await prisma.entitlement.findUniqueOrThrow({ where: { code } });
        await prisma.planEntitlement.upsert({ where: { planId_entitlementId: { planId: plan.id, entitlementId: entitlement.id } }, create: { planId: plan.id, entitlementId: entitlement.id, value: value as Prisma.InputJsonValue }, update: {} });
      }
    }
  }
}
export async function plans(audience: "candidate" | "company") {
  return prisma.servicePlan
    .findMany({
      where: { audience, isActive: true, deletedAt: null },
      orderBy: { displayOrder: "asc" },
    })
    .then((rows) =>
      Promise.all(rows.map(async (p) => ({
        ...p,
        metadata: { ...(p.metadata as Record<string, Prisma.JsonValue>), benefits: await planEntitlements(p.id) },
        purchasable:
          !p.isFree &&
          p.availability === "available" &&
          p.price.gt(0) &&
          paymentsConfigured(),
      }))),
    );
}
export function serializePayment<T extends { providerOrderCode: bigint }>(
  p: T,
) {
  return { ...p, providerOrderCode: p.providerOrderCode.toString() };
}
export async function listOrders(accountId: string) {
  const rows = await prisma.order.findMany({
    where: { purchasedByAccountId: accountId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      payments: { orderBy: { createdAt: "desc" } },
      subscription: true,
    },
  });
  return rows.map((o) => ({
    ...o,
    payments: o.payments.map(serializePayment),
  }));
}
export async function createOrder(
  accountId: string,
  audience: "candidate" | "company",
  planId: string,
  requestKey: string,
) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM accounts WHERE id = ${accountId}::uuid FOR UPDATE`;
    const previous = await tx.order.findUnique({ where: { requestKey } });
    if (previous) {
      if (
        previous.purchasedByAccountId !== accountId ||
        previous.planId !== planId
      )
        throw new AppError("Yêu cầu đã được sử dụng", "REQUEST_CONFLICT", 409);
      return previous;
    }
    await tx.$queryRaw`SELECT id FROM service_plans WHERE id = ${planId}::uuid FOR SHARE`;
    const plan = await tx.servicePlan.findFirst({
      where: { id: planId, audience, isActive: true, deletedAt: null },
    });
    if (
      !plan ||
      plan.availability !== "available" ||
      plan.isFree ||
      !plan.price.gt(0) ||
      !Number.isSafeInteger(Number(plan.price)) ||
      plan.currency !== "VND" ||
      plan.durationDays !== 30
    )
      throw new AppError("Gói chưa khả dụng để mua", "PLAN_UNAVAILABLE", 409);
    if (!paymentsConfigured())
      throw new AppError(
        "Thanh toán chưa được cấu hình",
        "PAYMENT_NOT_CONFIGURED",
        503,
      );
    const company =
      audience === "company"
        ? await tx.company.findFirst({
            where: { accountId, deletedAt: null },
            select: { id: true },
          })
        : null;
    if (audience === "company" && !company)
      throw new AppError("Không tìm thấy doanh nghiệp", "NOT_FOUND", 404);
    const benefits = readBenefits(await planEntitlements(plan.id, tx), audience);
    // Reuse an open order when a browser submits with another request key.
    const open = await tx.order.findFirst({
      where: {
        purchasedByAccountId: accountId,
        planId,
        status: "pending",
        paymentDeadlineAt: { gt: new Date() },
      },
    });
    if (open) return open;
    return tx.order.create({
      data: {
        code: `TC-${randomUUID()}`,
        purchasedByAccountId: accountId,
        planId,
        requestKey,
        totalAmount: plan.price,
        currency: plan.currency,
        paymentDeadlineAt: new Date(Date.now() + 30 * 60000),
        planSnapshot: {
          name: plan.name,
          audience,
          durationDays: plan.durationDays,
          benefits,
          companyId: company?.id ?? null,
        },
      },
    });
  });
}
export async function checkout(accountId: string, orderId: string) {
  const client = payos();
  const payment = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM orders WHERE id = ${orderId}::uuid FOR UPDATE`;
    const order = await tx.order.findFirst({
      where: { id: orderId, purchasedByAccountId: accountId, deletedAt: null },
    });
    if (!order) throw new AppError("Không tìm thấy đơn hàng", "NOT_FOUND", 404);
    if (
      order.status !== "pending" ||
      !order.paymentDeadlineAt ||
      order.paymentDeadlineAt <= new Date()
    )
      throw new AppError(
        "Đơn không còn chờ thanh toán",
        "ORDER_NOT_PAYABLE",
        409,
      );
    const existing = await tx.payment.findFirst({
      where: {
        orderId,
        provider: "payos",
        status: { in: ["pending", "processing"] },
      },
      orderBy: { createdAt: "desc" },
    });
    return (
      existing ??
      tx.payment.create({
        data: {
          orderId,
          provider: "payos",
          amount: order.totalAmount,
          currency: order.currency,
          expiresAt: order.paymentDeadlineAt,
        },
      })
    );
  });
  if (payment.checkoutUrl) return serializePayment(payment);
  const returnUrl = new URL(process.env.PAYMENT_RETURN_URL!);
  returnUrl.searchParams.set("orderId", orderId);
  try {
    const link = await client.paymentRequests.create({
      orderCode: Number(payment.providerOrderCode),
      amount: Number(payment.amount),
      description: "TOPCV PRO",
      returnUrl: returnUrl.toString(),
      cancelUrl: returnUrl.toString(),
      expiredAt: Math.floor(payment.expiresAt!.getTime() / 1000),
    });
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { checkoutUrl: link.checkoutUrl },
    });
    return serializePayment(updated);
  } catch {
    try {
      const info = await client.paymentRequests.get(
        Number(payment.providerOrderCode),
      );
      if (info.status === "PENDING" || info.status === "PROCESSING") {
        const recovered = await prisma.payment.update({
          where: { id: payment.id },
          data: { checkoutUrl: `https://pay.payos.vn/web/${info.id}` },
        });
        return serializePayment(recovered);
      }
      if (info.status === "PAID") await reconcilePayment(payment.id);
    } catch {
      /* Keep the attempt for reconciliation when the provider is unavailable. */
    }
    // An ambiguous timeout must retain the same provider code on retry.
    throw new AppError(
      "Chưa tạo được trang thanh toán. Vui lòng thử lại trên cùng đơn hàng.",
      "PAYMENT_PROVIDER_ERROR",
      502,
    );
  }
}
export async function settlePayment(
  providerOrderCode: number,
  reference: string,
  amount: number,
  payload: Prisma.InputJsonValue,
) {
  const payment = await prisma.payment.findUnique({
    where: { providerOrderCode: BigInt(providerOrderCode) },
  });
  if (!payment) return false; // payOS sends a signed test webhook when registering an endpoint.
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({
      where: { id: payment.orderId },
    });
    // Serialize renewals across different orders, followed by the order lock.
    await tx.$queryRaw`SELECT id FROM accounts WHERE id = ${order.purchasedByAccountId}::uuid FOR UPDATE`;
    await tx.$queryRaw`SELECT id FROM orders WHERE id = ${order.id}::uuid FOR UPDATE`;
    const fresh = await tx.order.findUniqueOrThrow({ where: { id: order.id } });
    const latest = await tx.payment.findUniqueOrThrow({
      where: { id: payment.id },
    });
    if (
      !Number.isSafeInteger(amount) ||
      !latest.amount.equals(amount) ||
      !fresh.totalAmount.equals(amount) ||
      latest.currency !== "VND"
    )
      throw new AppError(
        "Số tiền thanh toán không khớp",
        "PAYMENT_MISMATCH",
        409,
      );
    const priorEvent = await tx.paymentEvent.findUnique({
      where: { provider_reference: { provider: "payos", reference } },
    });
    if (priorEvent && priorEvent.paymentId !== latest.id)
      throw new AppError(
        "Mã giao dịch đã được sử dụng",
        "PAYMENT_CONFLICT",
        409,
      );
    if (latest.status === "succeeded") return true;
    if (fresh.status === "paid" || fresh.status === "refunded")
      throw new AppError(
        "Đơn hàng đã được thanh toán",
        "PAYMENT_REVIEW_REQUIRED",
        409,
      );
    const snapshot = fresh.planSnapshot as {
      audience: string;
      companyId: string | null;
      durationDays: number;
      benefits: unknown;
    };
    readBenefits(snapshot.benefits, snapshot.audience);
    const beneficiary =
      snapshot.audience === "company"
        ? { companyId: snapshot.companyId! }
        : { accountId: fresh.purchasedByAccountId };
    const previous = await tx.subscription.findFirst({
      where: {
        ...beneficiary,
        orderId: { not: null },
        status: { in: ["active", "scheduled"] },
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: "desc" },
    });
    const now = new Date();
    const window = nextSubscriptionWindow(
      now,
      previous?.expiresAt ?? null,
      snapshot.durationDays,
    );
    await tx.paymentEvent.create({
      data: { provider: "payos", reference, paymentId: latest.id, payload },
    });
    await tx.payment.update({
      where: { id: latest.id },
      data: { status: "succeeded", transactionCode: reference, paidAt: now },
    });
    await tx.order.update({
      where: { id: fresh.id },
      data: { status: "paid", paidAt: now },
    });
    await tx.subscription.create({
      data: {
        orderId: fresh.id,
        planId: fresh.planId,
        ...beneficiary,
        ...window,
        usageState: {},
      },
    });
    await notify(tx, { recipientAccountId: fresh.purchasedByAccountId, type: "payment", title: "Thanh toán thành công", description: window.status === "scheduled" ? "Gói Pro đã được thanh toán và sẽ bắt đầu sau gói hiện tại." : "Thanh toán đã được xác nhận. Gói Pro đã có hiệu lực.", link: snapshot.audience === "company" ? "/employer?tab=billing" : "/candidate?tab=orders", eventKey: `order:${fresh.id}:paid` });
    return true;
  });
}
export async function reconcilePayment(paymentId: string) {
  const p = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
  });
  if (p.status === "succeeded") return;
  const info = await payos().paymentRequests.get(Number(p.providerOrderCode));
  if (
    info.orderCode !== Number(p.providerOrderCode) ||
    info.amount !== Number(p.amount)
  )
    throw new AppError(
      "Giao dịch không khớp đơn hàng",
      "PAYMENT_MISMATCH",
      409,
    );
  if (info.status === "PAID") {
    if (info.amountPaid !== Number(p.amount) || info.amountRemaining !== 0)
      throw new AppError("Giao dịch cần đối soát", "PAYMENT_MISMATCH", 409);
    const transaction = info.transactions[0];
    if (!transaction)
      throw new AppError("Thiếu giao dịch thanh toán", "PAYMENT_MISMATCH", 409);
    await settlePayment(
      Number(p.providerOrderCode),
      transaction.reference,
      info.amountPaid,
      JSON.parse(JSON.stringify(info)),
    );
  } else if (info.status === "CANCELLED" || info.status === "EXPIRED") {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${p.orderId}::uuid FOR UPDATE`;
      await tx.payment.updateMany({
        where: { id: p.id, status: { in: ["pending", "processing"] } },
        data: { status: info.status === "CANCELLED" ? "cancelled" : "expired" },
      });
      await tx.order.updateMany({
        where: { id: p.orderId, status: "pending" },
        data: { status: info.status === "CANCELLED" ? "cancelled" : "expired" },
      });
    });
  }
}
export async function subscriptionOverview(accountId: string) {
  const plan = await currentPlan(accountId);
  const scheduled = await prisma.subscription.findMany({
    where: {
      ...(plan.companyId ? { companyId: plan.companyId } : { accountId }),
      status: { in: ["scheduled", "active"] },
      startedAt: { gt: new Date() },
    },
    orderBy: { startedAt: "asc" },
  });
  return { ...plan, scheduled };
}
