import { NextFunction, Request, Response } from "express";
import authService from "../services/auth.service";
import { successResponse } from "../utils/response";

import googleAuthService from "../services/google-auth.service";
import {
  googleStartSchema,
  googleCallbackSchema,
} from "../validators/google-auth.validate";
import { BadRequest } from "../exceptions";
import { SUCCESS_MESSAGE } from "../constants/message.constant";
import { COOKIE_NAME } from "../constants/cookie.constant";
import { TTL } from "../constants/ttl.constant";
class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    try {
      let newAccount,
        message = "";
      if (body.role === "candidate") {
        newAccount = await authService.candidateRegister(body);
        message = SUCCESS_MESSAGE.AUTH_CONTROLER.CREATE_CANDIDATE;
      }
      if (body.role === "company") {
        newAccount = await authService.companyRegister(body);
        message = SUCCESS_MESSAGE.AUTH_CONTROLER.CREATE_COMPANY;
      }
      return successResponse(res, newAccount, message, 201);
    } catch (error) {
      next(error);
    }
  }
  async registerVerifyEmail(req: Request, res: Response, next: NextFunction) {
    const { email, otp } = req.body;
    try {
      const token = await authService.registerVerifyEmail(email, otp);
      res.cookie(
        COOKIE_NAME.AUTH_CONTROLLER.REFRESH_TOKEN,
        token.refreshToken,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: TTL.AUTH_CONTROLLER.REFRESH_TOKEN,
          path: "/auth",
        },
      );
      return successResponse(
        res,
        token.accessToken,
        SUCCESS_MESSAGE.AUTH_CONTROLER.REGISTER_VERIFY_EMAIL,
      );
    } catch (error) {
      next(error);
    }
  }
  async resendVerifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.resendVerifyEmail(email);
      return successResponse(
        res,
        {},
        SUCCESS_MESSAGE.AUTH_CONTROLER.RESEND_OTP,
        201,
      );
    } catch (error) {
      next(error);
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    try {
      const token = await authService.login(body);
      res.cookie(
        COOKIE_NAME.AUTH_CONTROLLER.REFRESH_TOKEN,
        token?.refreshToken,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: TTL.AUTH_CONTROLLER.REFRESH_TOKEN,
          path: "/auth",
        },
      );
      return successResponse(res, token, SUCCESS_MESSAGE.AUTH_CONTROLER.LOGIN);
    } catch (error) {
      next(error);
    }
  }
  async logout(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.accesToken as string;
    const refreshToken = req.cookies.refreshToken;
    try {
      await authService.logout(accessToken, refreshToken);
      res.clearCookie(COOKIE_NAME.AUTH_CONTROLLER.REFRESH_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/auth",
      });
      return successResponse(res, {}, SUCCESS_MESSAGE.AUTH_CONTROLER.LOGOUT);
    } catch (error) {
      next(error);
    }
  }
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = req.accesToken as string;
      const profile = await authService.getProfile(accessToken);
      return successResponse(
        res,
        profile,
        SUCCESS_MESSAGE.AUTH_CONTROLER.GET_PROFILE,
        200,
      );
    } catch (error) {
      next(error);
    }
  }
  async getRefreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const newToken = await authService.getNewToken(refreshToken);
      res.cookie(
        COOKIE_NAME.AUTH_CONTROLLER.REFRESH_TOKEN,
        newToken?.newRefreshToken,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: TTL.AUTH_CONTROLLER.REFRESH_TOKEN,
          path: "/auth",
        },
      );
      return successResponse(
        res,
        newToken,
        SUCCESS_MESSAGE.AUTH_CONTROLER.REFRESH_TOKEN,
        201,
      );
    } catch (error) {
      next(error);
    }
  }
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const account = await authService.forgotPassword(email);
      return successResponse(
        res,
        account,
        SUCCESS_MESSAGE.AUTH_CONTROLER.CREATE_OTP,
      );
    } catch (error) {
      next(error);
    }
  }
  async resetForgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountId, password } = req.body;
      await authService.resetForgotPassword(accountId, password);
      return successResponse(
        res,
        {},
        SUCCESS_MESSAGE.AUTH_CONTROLER.RESET_PASSWORD,
      );
    } catch (error) {
      next(error);
    }
  }
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountId, password } = req.body;
      await authService.resetForgotPassword(accountId, password);
      return successResponse(
        res,
        {},
        SUCCESS_MESSAGE.AUTH_CONTROLER.RESET_PASSWORD,
      );
    } catch (error) {
      next(error);
    }
  }
  async googleRedirect(req: Request, res: Response, next: NextFunction) {
    try {
      const input = googleStartSchema.safeParse(req.query);
      if (!input.success)
        throw new BadRequest(
          "Thông tin đăng nhập Google không hợp lệ",
          "GOOGLE_INVALID_INPUT",
        );
      return successResponse(
        res,
        await googleAuthService.start(input.data),
        "Tiếp tục đăng nhập Google",
      );
    } catch (error) {
      next(error);
    }
  }
  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const input = googleCallbackSchema.safeParse(req.body);
      if (!input.success)
        throw new BadRequest(
          "Thông tin xác minh Google không hợp lệ",
          "GOOGLE_INVALID_INPUT",
        );
      return successResponse(
        res,
        await googleAuthService.callback(input.data),
        "Đăng nhập Google thành công",
      );
    } catch (error) {
      next(error);
    }
  }
  googleCallbackRedirect(req: Request, res: Response, next: NextFunction) {
    try {
      const url = new URL(
        "/api/auth/google/callback",
        process.env.FRONTEND_URL ?? "http://localhost:3000",
      );
      for (const key of ["code", "state", "error"]) {
        const value = req.query[key];
        if (typeof value === "string") url.searchParams.set(key, value);
      }
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Referrer-Policy", "no-referrer");
      res.redirect(url.toString());
    } catch (error) {
      next(error);
    }
  }
}

const authController = new AuthController();
export default authController;
