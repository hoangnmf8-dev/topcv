import express from "express";
import jobPostController from "../controllers/job-post.controller";
const jobPostRouter = express.Router();
jobPostRouter.get("/", jobPostController.getManyJobPost);
export default jobPostRouter;