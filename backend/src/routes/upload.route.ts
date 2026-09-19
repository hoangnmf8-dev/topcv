import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateMiddleware from "../middlewares/validate.middleware";
import uploadController from "../controllers/upload.controller";
import {
  presignUploadSchema,
  completeUploadSchema,
} from "../validators/upload.validate";

const uploadRouter = express.Router();
uploadRouter.post(
  "/presign",
  authMiddleware,
  validateMiddleware(presignUploadSchema),
  uploadController.presignUpload,
);
uploadRouter.post(
  "/completed",
  authMiddleware,
  validateMiddleware(completeUploadSchema),
  uploadController.uploadCompleted,
);
uploadRouter.post("/presign-dowload", authMiddleware, uploadController.getPresidnedDowload);

export default uploadRouter;
