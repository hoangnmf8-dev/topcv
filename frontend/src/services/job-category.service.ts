import { AppError } from "@/exceptions";
import { httpRequest } from "@/lib/utils";
import type { JobCategory } from "@/types";

class JobCategoryService {
  async getJobCategory(signal?: AbortSignal) {
    const response = await httpRequest.get<{
      success: boolean;
      data: JobCategory[];
    }>("/job-category", { signal });
    if (!response.data.success || !Array.isArray(response.data.data))
      throw new Error("Không thể tải danh sách ngành nghề");
    return response.data;
  }
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
    }
  }
}
const jobCategoryService = new JobCategoryService();
export default jobCategoryService;
