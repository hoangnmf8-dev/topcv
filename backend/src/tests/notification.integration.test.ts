import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "../utils/prisma";
import { notify, notificationList, markNotificationsRead } from "../services/notification.service";

test("notifications isolate recipients, deduplicate events and preserve read state", async () => {
  const accounts = await Promise.all([1, 2].map(() => prisma.account.create({ data: { email: `notification-${randomUUID()}@example.invalid`, passwordHash: "test", role: "candidate" } })));
  const first = accounts[0]!, second = accounts[1]!;
  try {
    const input = { recipientAccountId: first.id, type: "system" as const, title: "Test", description: "Test event", link: "/candidate", eventKey: randomUUID() };
    await prisma.$transaction(async tx => { await notify(tx, input); await notify(tx, input); });
    const list = await notificationList(first.id, 1);
    assert.equal(list.total, 1); assert.equal(list.unreadCount, 1);
    assert.equal((await notificationList(second.id, 1)).total, 0);
    assert.equal((await markNotificationsRead(second.id, list.items[0]!.id)).count, 0);
    await markNotificationsRead(first.id, list.items[0]!.id);
    const read = (await notificationList(first.id, 1)).items[0]!.readAt;
    assert.equal((await markNotificationsRead(first.id, list.items[0]!.id)).count, 0);
    assert.equal((await notificationList(first.id, 1)).items[0]!.readAt!.getTime(), read!.getTime());
    assert.equal((await notificationList(first.id, 1, true)).total, 0);
    await prisma.$transaction(async tx => { await notify(tx, { ...input, eventKey: randomUUID() }); });
    await markNotificationsRead(second.id);
    assert.equal((await notificationList(first.id, 1)).unreadCount, 1);
    await markNotificationsRead(first.id);
    assert.equal((await notificationList(first.id, 1)).unreadCount, 0);
    await prisma.notification.createMany({ data: Array.from({ length: 23 }, (_, index) => ({ recipientAccountId: first.id, title: `Page ${index}`, description: "Pagination fixture", eventKey: randomUUID() })) });
    const page1 = await notificationList(first.id, 1);
    const page2 = await notificationList(first.id, 2);
    assert.equal(page1.items.length, 20);
    assert.equal(page2.items.length, 5);
    assert.equal(new Set([...page1.items, ...page2.items].map(item => item.id)).size, 25);
    assert.equal((await notificationList(first.id, 3)).items.length, 0);
    assert.equal((await notificationList(second.id, 1)).total, 0);
  } finally {
    await prisma.account.deleteMany({ where: { id: { in: accounts.map(a => a.id) } } });
    await prisma.$disconnect();
  }
});
