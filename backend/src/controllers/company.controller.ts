import { Request, Response, NextFunction } from "express";
import companyService from "../services/company.service";
import { prisma } from "../utils/prisma";
import { AppError } from "../exceptions";
import { successResponse } from "../utils/response";

class CompanyController {
  async getCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const params = req.query as unknown as {page: number, limit: number};
      const company = await companyService.getCompanies(params)
      return successResponse(res, company, "Lấy thông tin công ty thành công");
    } catch(error) {
      next(error);
    }
  }
  async updateCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const id = req.params.id as unknown as string;
      const owned = await prisma.company.findFirst({ where: { id, accountId: req.profile.id } });
      if (!owned) throw new AppError("Không có quyền truy cập", "FORBIDDEN", 403);
      const company = await companyService.updateCompany(id, data);
      return successResponse(res, company, "Lưu thông tin thành công", 201);
    } catch (error) {
      next(error);
    }
  };
  async getDetailCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.params.id as unknown as string;
      const company = await companyService.getDetailCompany(code);
      return successResponse(res, company, "Lấy thông tin công ty thành công");
    } catch(error) {
      next(error);
    }
  };
}
const companyController = new CompanyController();
export default companyController;
