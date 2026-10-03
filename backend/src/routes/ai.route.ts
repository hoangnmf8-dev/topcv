import express from "express";
import { authMiddleware, requireRoles } from "../middlewares/auth.middleware";
import aiController from "../controllers/ai.controller";
const aiRouter = express.Router();
aiRouter.post(
  "/generate",
  authMiddleware,
  requireRoles("candidate", "company"),
  aiController.generateTextAI,
);
export default aiRouter;
