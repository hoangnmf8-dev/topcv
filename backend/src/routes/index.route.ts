import express from "express";
import authRouter from "./auth.route";
import uploadRouter from "./upload.route";
import validateMiddleware from "../middlewares/validate.middleware";
import { presignUploadSchema } from "../validators/upload.validate";
import companyRouter from "./company.route";
import jobPostRouter from "./job-post.route";
const indexRouter = express.Router();

indexRouter.use("/auth", authRouter);
indexRouter.use("/upload", uploadRouter);
indexRouter.use("/company", companyRouter);
indexRouter.use("/job-post", jobPostRouter);
export default indexRouter;
