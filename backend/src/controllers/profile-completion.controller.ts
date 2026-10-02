import type { Request, Response, NextFunction } from "express";
import service from "../services/profile-completion.service";
import { successResponse } from "../utils/response";
export default {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(
        res,
        await service.get(req.profile.id),
        "Mức độ hoàn thiện hồ sơ",
      );
    } catch (error) {
      next(error);
    }
  },
};
