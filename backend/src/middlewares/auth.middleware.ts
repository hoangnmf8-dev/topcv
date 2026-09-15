import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/response";
import accountService from "../services/account.service";
import {
  AccountBlockedError,
  AccountNotFoundError,
  Unauthorized,
} from "../exceptions";
import { ERROR_MESSAGE } from "../constants/message.constant";
import { ERROR_CODE } from "../constants/code.constant";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.headers["authorization"]?.split(" ").slice(-1).join();
  if (!accessToken) {
    return errorResponse(
      res,
      {
        message: "Không có quyền truy cập",
        status: 401,
      },
      401,
    );
  }
  const existAccount = await accountService.getAccount(accessToken);
  if ((existAccount && existAccount.status === "blocked") || !existAccount) {
    throw new Unauthorized(
      ERROR_MESSAGE.AUTH_SERVICE.UNAUTHORIZED,
      ERROR_CODE.AUTH_SERVICE.UNAUTHORIZED,
    );
  };
  req.accesToken = accessToken;
  req.profile = existAccount;
  next();
};
