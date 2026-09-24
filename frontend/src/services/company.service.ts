import { AppError } from "@/exceptions";
import { httpRequest } from "@/lib/utils";
import { CompanyDataUpdate } from "@/types";

class CompanyService {
  async updateCompany(companyId: string, data: CompanyDataUpdate) {
    try {
      const response = await httpRequest.patch(`/company/${companyId}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        return {
          success: false,
          status: error.status,
          message: error.message,
          code: error.code,
        };
      }
      return {
        success: false,
        status: 500,
        message: "Đã xảy ra lỗi",
      };
    }
  }
  async getCompanies(params: { page: number; limit: number }) {
    try {
      const company = await httpRequest.get("/company", {
        params,
      });
      return company.data;
    } catch (error) {
      if (error instanceof AppError) {
        return {
          success: false,
          status: error.status,
          message: error.message,
          code: error.code,
        };
      }
      return {
        success: false,
        status: 500,
        message: "Đã xảy ra lỗi",
      };
    }
  }
  async getDetailCompany(code: string) {
    try {
      const response = await httpRequest.get(`/company/${code}`, {
        params: {
          code,
        },
      });
      return response.data.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw new Error(error.message);
      }
      throw new Error("Đã xảy ra lỗi hệ thống");
    }
  }
}
const companyService = new CompanyService();
export default companyService;
