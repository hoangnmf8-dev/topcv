import type { Request, Response, NextFunction } from "express";
import locationService from "../services/location.service";
import { successResponse } from "../utils/response";
import jobCategoryService from "../services/job-category.service";

class JobCategoryController {
  async getJobCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const jobCategory = await jobCategoryService.getJobCategory();
      return successResponse(res, jobCategory, "Lấy thông tin danh mục nghề thành công");
    } catch(error) {
      next(error);
    }
  };
  async getTopJob(req: Request, res: Response, next: NextFunction) {
    try {
      const topJob = await jobCategoryService.getTopJob();
      return successResponse(res, topJob, "Lấy thông tin nghề nổi bật thành công");
    } catch(error) {
      next(error);
    }
  };
};
const jobCategoryController = new JobCategoryController();
export default jobCategoryController;