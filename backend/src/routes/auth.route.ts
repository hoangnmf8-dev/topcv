import express from "express";
import authController from "../controllers/auth.controller";
import validateMiddleware from "../middlewares/validate.middleware";
import { resetPasswordSchema, loginSchema, registerSchema } from "../validators/auth.validate";
import { authMiddleware } from "../middlewares/auth.middleware";
const authRouter = express.Router();

authRouter.post("/auth/register", validateMiddleware(registerSchema),authController.register);
authRouter.post("/auth/register-verify-email", authController.registerVerifyEmail);
authRouter.post("/auth/resend-verify-email", authController.resendVerifyEmail);
authRouter.post("/auth/login", validateMiddleware(loginSchema), authController.login);
authRouter.post("/auth/refresh-token", authController.getRefreshToken);
authRouter.post("/auth/forgot-password", authController.forgotPassword);
authRouter.post("/auth/reset-forgot-password", validateMiddleware(resetPasswordSchema), authController.resetForgotPassword);
authRouter.get("/auth/google", authController.googleRedirect);
authRouter.get("/auth/google/callback", authController.googleCallback);

authRouter.use(authMiddleware);
authRouter.post("/auth/change-password", validateMiddleware(resetPasswordSchema), authController.changePassword);
authRouter.get("/auth/profile", authController.getProfile);
authRouter.delete("/auth/logout", authController.logout);
export default authRouter;