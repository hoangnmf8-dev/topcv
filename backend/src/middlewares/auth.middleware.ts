import { NextFunction, Request, Response } from "express";
import accountService from "../services/account.service";
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
  const account = token ? await accountService.getAccount(token) : null;
  if (!account || account.status !== "active" || account.deletedAt) {
    res
      .status(401)
      .json({ success: false, message: "Đăng nhập để sử dụng tính năng này" });
    return;
  }
  req.accesToken = token!;
  req.profile = account;
  next();
};
export const requireRoles =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.profile || !roles.includes(req.profile.role)) {
      res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập" });
      return;
    }
    next();
  };
