import { jobPostCreateSchema } from "../types/job-post-create.type";
import { prisma } from "../utils/prisma";
import { Request, Response, NextFunction } from "express";
import jobPostService from "../services/job-post.service";
import { jobPostQuerySchema } from "../types/job-post.type";

class JobPostController {
  async createJobPost(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.profile?.role !== "company")
        return res
          .status(403)
          .json({ message: "Chỉ nhà tuyển dụng được đăng tin" });
      const parsed = jobPostCreateSchema.safeParse(req.body);
      if (!parsed.success)
        return res
          .status(400)
          .json({
            message: "Thông tin tin tuyển dụng không hợp lệ",
            errors: parsed.error.issues,
          });
      const company = await prisma.company.findFirst({
        where: { accountId: req.profile.id, deletedAt: null },
      });
      if (!company)
        return res
          .status(403)
          .json({ message: "Không tìm thấy hồ sơ doanh nghiệp" });
      const data = parsed.data;
      const [ward, category, jobTitle] = await Promise.all([
        prisma.ward.findFirst({
          where: { id: data.wardId, provinceId: data.provinceId },
        }),
        prisma.jobCategory.findUnique({ where: { id: data.jobCategoryId } }),
        prisma.jobTitle.findFirst({
          where: {
            id: data.jobTitleId,
            jobCategoryId: data.jobCategoryId,
            deletedAt: null,
          },
        }),
      ]);
      if (!jobTitle)
        return res
          .status(400)
          .json({
            message:
              "Chức danh không thuộc ngành nghề đã chọn hoặc không còn hoạt động",
          });
      if (!ward || !category)
        return res
          .status(400)
          .json({ message: "Ngành nghề hoặc địa điểm không hợp lệ" });
      const job = await prisma.jobPost.create({
        data: {
          ...data,
          deadlineAt: new Date(data.deadlineAt),
          companyId: company.id,
          status: "PENDING",
        },
      });
      return res.status(201).json(job);
    } catch (error) {
      next(error);
    }
  }
  async getJobPost(req: Request, res: Response, next: NextFunction) {
    try {
      return res.json(await jobPostService.getJobPost(String(req.params.id)));
    } catch (error) {
      next(error);
    }
  }
  async getManyJobPost(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = jobPostQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Bộ lọc không hợp lệ",
            errors: parsed.error.issues,
          });
      }
      const params = parsed.data;
      const companyData = await jobPostService.getManyJobPost(params);
      return res.json(companyData);
    } catch (error) {
      next(error);
    }
  }
}
const jobPostController = new JobPostController();
export default jobPostController;
