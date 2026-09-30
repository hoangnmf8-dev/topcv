import { prisma } from "../utils/prisma";
import { membership } from "../utils/realtime";
export async function chatState(accountId: string) {
  const groups = await prisma.message.groupBy({
    by: ["conversationId"],
    where: {
      conversation: membership(accountId),
      senderAccountId: { not: accountId },
      deletedAt: null,
      readAt: null,
    },
    _count: { _all: true },
  });
  return {
    accountId,
    total: groups.reduce((n, g) => n + g._count._all, 0),
    counts: Object.fromEntries(
      groups.map((g) => [g.conversationId, g._count._all]),
    ),
  };
}
export async function receipt(accountId: string, ids: string[], read: boolean) {
  const where = {
    id: { in: ids },
    conversation: membership(accountId),
    senderAccountId: { not: accountId },
    deletedAt: null,
  };
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    await tx.message.updateMany({
      where: { ...where, deliveredAt: null },
      data: { deliveredAt: now },
    });
    if (read)
      await tx.message.updateMany({
        where: { ...where, readAt: null },
        data: { readAt: now },
      });
    return tx.message.findMany({ where, select: { senderAccountId: true } });
  });
}
