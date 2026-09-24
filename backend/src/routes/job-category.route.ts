import express from "express";
import jobCategoryController from "../controllers/job-category.controller";
const jobCategoryRouter = express.Router();
jobCategoryRouter.get("/", jobCategoryController.getJobCategory);
jobCategoryRouter.get("/top-job", jobCategoryController.getTopJob);
export default jobCategoryRouter;