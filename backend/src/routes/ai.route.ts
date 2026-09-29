import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import aiController from "../controllers/ai.controller";
const aiRouter = express.Router();
aiRouter.post("/generate", authMiddleware, aiController.generateTextAI);
export default aiRouter;