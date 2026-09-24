import { AppError } from "@/exceptions";
import { httpRequest } from "@/lib/utils";

class JobCategoryService {
  async getJobCategory() {
    try {
      const response = await httpRequest.get("/job-category");
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
    };
  };
  async getTopJob() {
     try {
      const response = await httpRequest.get("/job-category/top-job");
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
    };
  }
};
const jobCategoryService = new JobCategoryService();
export default jobCategoryService;
