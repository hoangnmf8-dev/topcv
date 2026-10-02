import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import controller from "../controllers/saved-job.controller";
const router = Router();
router.use(authMiddleware);
router.get("/", controller.list);
router.put("/:id", controller.save);
router.delete("/:id", controller.remove);
export default router;
