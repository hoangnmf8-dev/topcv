import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import controller from "../controllers/application.controller";
const router = Router();
router.use(authMiddleware);
router.post("/", controller.create);
router.get("/job/:jobPostId", controller.status);
export default router;
