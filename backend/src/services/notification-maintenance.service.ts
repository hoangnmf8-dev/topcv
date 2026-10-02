import { prisma } from "../utils/prisma";
import { notify } from "./notification.service";

export async function subscriptionNotifications(now = new Date()) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      orderId: { not: null },
      status: { in: ["active", "scheduled"] },
      startedAt: { lte: now },
      expiresAt: { lte: new Date(now.getTime() + 3 * 86400000) },
    },
    include: { company: true, plan: true },
  });
  for (const sub of subscriptions) {
    const accountId = sub.accountId ?? sub.company!.accountId;
    const expired = sub.expiresAt <= now;
    await prisma.$transaction(async (tx) => {
      await notify(tx, {
        recipientAccountId: accountId,
        type: "service_plan",
        title: expired ? "Kỳ sử dụng Pro đã kết thúc" : "Gói Pro sắp hết hạn",
        description: expired
          ? "Kiểm tra gói hiện tại. Nếu trở về Free và vượt giới hạn CV, hãy xóa bớt CV hoặc mua Pro để tiếp tục chỉnh sửa."
          : `Gói Pro sẽ hết hạn vào ${sub.expiresAt.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}.`,
        link: sub.companyId ? "/employer?tab=billing" : "/candidate?tab=orders",
        eventKey: `subscription:${sub.id}:${expired ? "expired" : "expiring"}`,
      });
    });
  }
}
