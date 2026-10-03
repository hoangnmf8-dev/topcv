import type { Request, Response, NextFunction } from "express";
import { AppError } from "../exceptions";
import service from "../services/saved-job.service";
import { savedJobIdSchema } from "../validators/saved-job.validate";
import { successResponse } from "../utils/response";
function jobId(req: Request) {
  const parsed = savedJobIdSchema.safeParse(req.params.id);
  if (!parsed.success)
    throw new AppError("ID tin tuyển dụng không hợp lệ", "BAD_REQUEST", 400);
  return parsed.data;
}
class SavedJobController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(
        res,
        await service.list(req.profile.id),
        "Danh sách tin đã lưu",
      );
    } catch (error) {
      next(error);
    }
  }
  async save(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(
        res,
        await service.save(req.profile.id, jobId(req)),
        "Đã lưu tin tuyển dụng",
      );
    } catch (error) {
      next(error);
    }
  }
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(
        res,
        await service.remove(req.profile.id, jobId(req)),
        "Đã bỏ lưu tin tuyển dụng",
      );
    } catch (error) {
      next(error);
    }
  }
}
export default new SavedJobController();
