import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AppError } from "../exceptions";
import { notificationList, markNotificationsRead } from "../services/notification.service";

const router = Router();
router.use(authMiddleware);
router.get("/", async (req, res) => {
  const input = z.object({ page: z.coerce.number().int().min(1).max(10000).default(1), unread: z.enum(["true", "false"]).default("false") }).safeParse(req.query);
  if (!input.success) throw new AppError("Tham số không hợp lệ", "INVALID_INPUT", 400);
  res.json({ data: await notificationList(req.profile.id, input.data.page, input.data.unread === "true") });
});
router.patch("/read-all", async (req, res) => { res.json({ data: await markNotificationsRead(req.profile.id) }); });
router.patch("/:id/read", async (req, res) => {
  const id = z.uuid().safeParse(req.params.id);
  if (!id.success) throw new AppError("Mã thông báo không hợp lệ", "INVALID_INPUT", 400);
  res.json({ data: await markNotificationsRead(req.profile.id, id.data) });
});
export default router;
