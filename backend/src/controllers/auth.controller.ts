import { NextFunction, Request, Response } from "express";
import authService from "../services/auth.service";
import { successResponse } from "../utils/response";

import { redisClient } from "../utils/redis";
import { uuidv7 } from "uuidv7";
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
      res.cookie(COOKIE_NAME.AUTH_CONTROLLER.REFRESH_TOKEN, token.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: TTL.AUTH_CONTROLLER.REFRESH_TOKEN,
        path: "/auth",
      });
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
      return successResponse(res, {}, SUCCESS_MESSAGE.AUTH_CONTROLER.RESEND_OTP, 201);
    } catch (error) {
      next(error);
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    try {
      const token = await authService.login(body);
      res.cookie(COOKIE_NAME.AUTH_CONTROLLER.REFRESH_TOKEN, token?.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: TTL.AUTH_CONTROLLER.REFRESH_TOKEN,
        path: "/auth",
      });
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
      return successResponse(res, profile, SUCCESS_MESSAGE.AUTH_CONTROLER.GET_PROFILE, 200);
    } catch (error) {
      next(error);
    }
  }
  async getRefreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const newToken = await authService.getNewToken(refreshToken);
      res.cookie(COOKIE_NAME.AUTH_CONTROLLER.REFRESH_TOKEN, newToken?.newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: TTL.AUTH_CONTROLLER.REFRESH_TOKEN,
        path: "/auth",
      });
      return successResponse(res, newToken, SUCCESS_MESSAGE.AUTH_CONTROLER.REFRESH_TOKEN, 201);
    } catch (error) {
      next(error);
    }
  }
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const account = await authService.forgotPassword(email);
      return successResponse(res, account, SUCCESS_MESSAGE.AUTH_CONTROLER.CREATE_OTP);
    } catch (error) {
      next(error);
    }
  }
  async resetForgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountId, password } = req.body;
      await authService.resetForgotPassword(accountId, password);
      return successResponse(res, {}, SUCCESS_MESSAGE.AUTH_CONTROLER.RESET_PASSWORD);
    } catch (error) {
      next(error);
    }
  }
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountId, password } = req.body;
      await authService.resetForgotPassword(accountId, password);
      return successResponse(res, {}, SUCCESS_MESSAGE.AUTH_CONTROLER.RESET_PASSWORD);
    } catch (error) {
      next(error);
    }
  }
  async googleRedirect(req: Request, res: Response, next: NextFunction) {
    const { role } = req.query; //frontend dùng window location chuyển hướng window.location.href =
    //`http://localhost:3100/auth/google?role=${role}`;
    const state = uuidv7();
    await redisClient.setEx(`oauth2:${state}`, 5 * 60, role as unknown as string);
    const url = `https://accounts.google.com/o/oauth2/v2/auth`;
    const params = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      response_type: "code",
      scope: "email profile",
      access_type: "offline",
      state,
    };
    const urlRedirect = `${url}?${new URLSearchParams(params as unknown as URLSearchParams).toString()}`;
    res.redirect(urlRedirect);
  }
  async googleCallback(req: Request, res: Response, next: NextFunction) {
    console.log(req.query)
    const { code, state } = req.query;
    const response = await fetch(`https:oauth2.googleapis.com/token`, {
      method: "POST",
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }),
    });
    const { access_token } = await response.json();
    const responseUser = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );
    const { email, name, picture } = await responseUser.json();
    const token = await authService.authGoogle(
      email,
      name,
      state as unknown as string,
      picture,
    );
    res.cookie(COOKIE_NAME.AUTH_CONTROLLER.REFRESH_TOKEN, token?.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: TTL.AUTH_CONTROLLER.REFRESH_TOKEN,
      path: "/auth",
    });
    return successResponse(res, token.accessToken, SUCCESS_MESSAGE.AUTH_CONTROLER.LOGIN);
  };
};

const authController = new AuthController();
export default authController;
