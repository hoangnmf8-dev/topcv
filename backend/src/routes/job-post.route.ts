import { authMiddleware, requireRoles } from "../middlewares/auth.middleware";
import express from "express";
import jobPostController from "../controllers/job-post.controller";
const jobPostRouter = express.Router();
jobPostRouter.post(
  "/",
  authMiddleware,
  requireRoles("company"),
  jobPostController.createJobPost,
);
jobPostRouter.get("/", jobPostController.getManyJobPost);
jobPostRouter.get("/:id", jobPostController.getJobPost);
export default jobPostRouter;
