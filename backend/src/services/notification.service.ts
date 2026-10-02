import { prisma } from "../utils/prisma";
import type { Prisma, NotificationType } from "../generated/prisma/client";

export async function notify(db: Prisma.TransactionClient, input: { recipientAccountId: string; type: NotificationType; title: string; description: string; link: string; eventKey: string }) {
  return db.notification.upsert({ where: { eventKey: input.eventKey }, create: { ...input, title: input.title.slice(0, 150), description: input.description.slice(0, 255) }, update: {} });
}
export async function notificationList(accountId: string, page: number, unreadOnly = false) {
  const where = { recipientAccountId: accountId, deletedAt: null, ...(unreadOnly ? { readAt: null } : {}) };
  const [items, total, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * 20, take: 20 }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { recipientAccountId: accountId, deletedAt: null, readAt: null } }),
  ]);
  return { items, total, unreadCount, page };
}
export async function markNotificationsRead(accountId: string, id?: string) {
  return prisma.notification.updateMany({ where: { recipientAccountId: accountId, deletedAt: null, readAt: null, ...(id ? { id } : {}) }, data: { readAt: new Date() } });
}
