import express from "express";
import authRouter from "./auth.route";
import uploadRouter from "./upload.route";
import validateMiddleware from "../middlewares/validate.middleware";
import { presignUploadSchema } from "../validators/upload.validate";
const indexRouter = express.Router();

indexRouter.use(authRouter);
indexRouter.use(validateMiddleware(presignUploadSchema), uploadRouter);
export default indexRouter;
