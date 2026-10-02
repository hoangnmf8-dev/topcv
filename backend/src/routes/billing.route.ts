import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth.middleware";
import { prisma } from "../utils/prisma";
import { AppError } from "../exceptions";
import {
  plans,
  createOrder,
  checkout,
  listOrders,
  reconcilePayment,
  settlePayment,
  subscriptionOverview,
  serializePayment,
} from "../services/billing.service";
import { candidateAccess } from "../services/subscription.service";
import { payos } from "../services/payos.service";

const router = Router();
function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success)
    throw new AppError("Dữ liệu yêu cầu không hợp lệ", "INVALID_INPUT", 400);
  return parsed.data;
}
router.get("/plans", async (req, res) => {
  const audience = parse(
    z.enum(["candidate", "company"]),
    req.query.audience ?? "candidate",
  );
  res.json({ data: await plans(audience) });
});
router.post("/webhook/payos", async (req, res) => {
  let data;
  try {
    data = await payos().webhooks.verify(req.body);
  } catch {
    throw new AppError("Webhook không hợp lệ", "INVALID_WEBHOOK", 400);
  }
  if (data.code === "00") {
    if (
      data.currency !== "VND" ||
      !Number.isSafeInteger(data.orderCode) ||
      !data.reference
    )
      throw new AppError(
        "Dữ liệu giao dịch không hợp lệ",
        "INVALID_WEBHOOK",
        400,
      );
    await settlePayment(
      data.orderCode,
      data.reference,
      data.amount,
      JSON.parse(JSON.stringify(data)),
    );
  }
  res.json({ success: true });
});
router.use(authMiddleware);
router.get("/admin/orders", async (req, res) => {
  if (
    req.profile.role !== "admin" ||
    req.profile.deletedAt ||
    req.profile.status !== "active"
  )
    throw new AppError("Không có quyền quản trị", "FORBIDDEN", 403);
  const rows = await prisma.order.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { payments: true, subscription: true },
  });
  res.json({
    data: rows.map((o) => ({
      ...o,
      payments: o.payments.map(serializePayment),
    })),
  });
});
router.use((req, _res, next) => {
  if (
    !["candidate", "company"].includes(req.profile.role) ||
    req.profile.deletedAt ||
    req.profile.status !== "active"
  )
    throw new AppError("Không có quyền mua gói", "FORBIDDEN", 403);
  next();
});
router.get("/subscription", async (req, res) =>
  res.json({ data: await subscriptionOverview(req.profile.id) }),
);
router.get("/cv-access", async (req, res) => {
  const candidate = await prisma.candidate.findFirst({
    where: { accountId: req.profile.id, deletedAt: null },
    select: { id: true },
  });
  if (!candidate)
    throw new AppError("Không tìm thấy ứng viên", "NOT_FOUND", 404);
  res.json({ data: await candidateAccess(req.profile.id, candidate.id) });
});
router.get("/orders", async (req, res) =>
  res.json({ data: await listOrders(req.profile.id) }),
);
router.post("/orders", async (req, res) => {
  const input = parse(
    z.object({ planId: z.string().uuid(), requestKey: z.string().uuid() }),
    req.body,
  );
  res
    .status(201)
    .json({
      data: await createOrder(
        req.profile.id,
        req.profile.role as "candidate" | "company",
        input.planId,
        input.requestKey,
      ),
    });
});
router.post("/orders/:id/checkout", async (req, res) =>
  res.json({
    data: await checkout(
      req.profile.id,
      parse(z.string().uuid(), req.params.id),
    ),
  }),
);
router.post("/orders/:id/reconcile", async (req, res) => {
  const id = parse(z.string().uuid(), req.params.id);
  const order = await prisma.order.findFirst({
    where: { id, purchasedByAccountId: req.profile.id, deletedAt: null },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) throw new AppError("Không tìm thấy đơn hàng", "NOT_FOUND", 404);
  if (order.payments[0] && order.status !== "paid")
    await reconcilePayment(order.payments[0].id);
  res.json({ success: true });
});
export default router;
