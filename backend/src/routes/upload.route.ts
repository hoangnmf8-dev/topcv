import express from "express";
import validateMiddleware from "../middlewares/validate.middleware";
import uploadController from "../controllers/upload.controller";
const uploadRouter = express.Router();
uploadRouter.post("/upload/presign", uploadController.presignUpload);
uploadRouter.post("/upload/completed", uploadController.uploadCompleted);

export default uploadRouter;
