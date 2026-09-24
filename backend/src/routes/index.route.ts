import candidateRouter from "./candidate.route";
import express from "express";
import authRouter from "./auth.route";
import uploadRouter from "./upload.route";
import companyRouter from "./company.route";
import jobPostRouter from "./job-post.route";
import locationRouter from "./location.route";
import jobCategoryRouter from "./job-category.route";

const indexRouter = express.Router();
indexRouter.use("/auth", authRouter);
indexRouter.use("/upload", uploadRouter);
indexRouter.use("/company", companyRouter);
indexRouter.use("/job-post", jobPostRouter);
indexRouter.use("/location", locationRouter);
indexRouter.use("/job-category", jobCategoryRouter);
indexRouter.use("/candidate", candidateRouter);
export default indexRouter;
