import express from "express";
import authController from "../controllers/auth.controller";
import validateMiddleware from "../middlewares/validate.middleware";
import { resetPasswordSchema, loginSchema, registerSchema } from "../validators/auth.validate";
import { authMiddleware } from "../middlewares/auth.middleware";
const authRouter = express.Router();

authRouter.post("/register", validateMiddleware(registerSchema),authController.register);
authRouter.post("/register-verify-email", authController.registerVerifyEmail);
authRouter.post("/resend-verify-email", authController.resendVerifyEmail);
authRouter.post("/login", validateMiddleware(loginSchema), authController.login);
authRouter.post("/refresh-token", authController.getRefreshToken);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-forgot-password", validateMiddleware(resetPasswordSchema), authController.resetForgotPassword);
authRouter.get("/google", authController.googleRedirect);
authRouter.get("/google/callback", authController.googleCallback);

authRouter.use(authMiddleware);
authRouter.post("/change-password", validateMiddleware(resetPasswordSchema), authController.changePassword);
authRouter.get("/profile", authController.getProfile);
authRouter.delete("/logout", authController.logout);
export default authRouter;