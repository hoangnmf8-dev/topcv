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
}
const companyService = new CompanyService();
export default companyService;
