import type { Request, Response, NextFunction } from "express";
import { AppError } from "../exceptions";
import {
  applicationIdSchema,
  applicationCreateSchema,
} from "../validators/application.validate";
import service from "../services/application.service";
import { successResponse } from "../utils/response";
export default {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = applicationCreateSchema.safeParse(req.body);
      if (!input.success)
        throw new AppError(
          "Thông tin ứng tuyển không hợp lệ",
          "BAD_REQUEST",
          400,
        );
      return successResponse(
        res,
        await service.create(req.profile.id, input.data),
        "Ứng tuyển thành công",
        201,
      );
    } catch (error) {
      next(error);
    }
  },
  async status(req: Request, res: Response, next: NextFunction) {
    try {
      const id = applicationIdSchema.safeParse(req.params.jobPostId);
      if (!id.success)
        throw new AppError("ID không hợp lệ", "BAD_REQUEST", 400);
      return successResponse(
        res,
        await service.status(req.profile.id, id.data),
        "Trạng thái ứng tuyển",
      );
    } catch (error) {
      next(error);
    }
  },
};
