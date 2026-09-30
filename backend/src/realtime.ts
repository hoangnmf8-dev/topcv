import { prisma } from "./utils/prisma";
import { membership } from "./utils/realtime";
import { receipt } from "./services/chat-state.service";
import { z } from "zod";
import jwtService from "./services/jwt.service";
import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import accountService from "./services/account.service";
let io: Server;
const online = new Map<string, Set<string>>();
export function isOnline(id: string) {
  return !!online.get(id)?.size;
}
async function notifyPresence(id: string) {
  const conversations = await prisma.conversation.findMany({
    where: membership(id),
    select: {
      candidate: { select: { accountId: true } },
      company: { select: { accountId: true } },
    },
  });
  const peers = [
    ...new Set(
      conversations.flatMap((c) => [
        c.candidate.accountId,
        c.company.accountId,
      ]),
    ),
  ];
  io.to(peers.map((p) => `account:${p}`)).emit("presence:changed");
}
export function initRealtime(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (typeof token !== "string") {
        return next(new Error("UNAUTHORIZED"));
      }
      // Dùng lại logic JWT + blacklist Redis hiện có.
      const account = await accountService.getAccount(token);
      if (
        !account ||
        account.status !== "active" ||
        account.deletedAt ||
        !["candidate", "company"].includes(account.role)
      ) {
        return next(new Error("UNAUTHORIZED"));
      }
      const claims = jwtService.verifyAccessToken(token);
      if (typeof claims === "string" || !claims.exp)
        return next(new Error("UNAUTHORIZED"));
      socket.data.expiresAt = claims.exp * 1000;
      socket.data.token = token;
      socket.data.accountId = account.id;
      next();
    } catch {
      next(new Error("UNAUTHORIZED"));
    }
  });
  io.on("connection", async (socket) => {
    await socket.join(`account:${socket.data.accountId}`);
    if (!socket.connected) return;
    const id = socket.data.accountId as string;
    const sockets = online.get(id) ?? new Set<string>();
    sockets.add(socket.id);
    online.set(id, sockets);
    void notifyPresence(id).catch(() => {});
    socket.on("message:receipt", async (payload, ack) => {
      const parsed = z
        .object({
          ids: z.array(z.string().uuid()).min(1).max(100),
          read: z.boolean(),
        })
        .safeParse(payload);
      if (!parsed.success) {
        if (typeof ack === "function") ack({ ok: false });
        return;
      }
      try {
        const rows = await receipt(id, parsed.data.ids, parsed.data.read);
        io.to(
          [...new Set([id, ...rows.map((r) => r.senderAccountId)])].map(
            (p) => `account:${p}`,
          ),
        ).emit("message:state");
        if (typeof ack === "function") ack({ ok: true });
      } catch {
        if (typeof ack === "function") ack({ ok: false });
      }
    });
    // Frontend dùng sự kiện này để đồng bộ sau khi đã vào room.
    socket.emit("session:ready");
    const expire = setTimeout(
      () => socket.disconnect(true),
      Math.max(0, socket.data.expiresAt - Date.now()),
    );
    const check = setInterval(async () => {
      try {
        const account = await accountService.getAccount(socket.data.token);
        if (!account || account.deletedAt || account.status !== "active")
          socket.disconnect(true);
      } catch {
        socket.disconnect(true);
      }
    }, 30000);
    socket.on("disconnect", () => {
      clearTimeout(expire);
      clearInterval(check);
      sockets.delete(socket.id);
      if (!sockets.size) online.delete(id);
      void notifyPresence(id).catch(() => {});
    });
  });
  return io;
}
export function publishMessage(accountIds: string[], message: unknown) {
  const rooms = accountIds.map((id) => `account:${id}`);
  io.to(rooms).emit("message:new", message);
}
