import { AppError } from "@/exceptions";
import { httpRequest } from "@/lib/utils";

import type { Job, JobPostListQuery } from "@/types";

class JobPostService {
  async getJobPost(id: string, signal?: AbortSignal): Promise<Job> {
    const response = await httpRequest.get<Job>(
      `/job-post/${encodeURIComponent(id)}`,
      { signal },
    );
    return response.data;
  }

  async getJobPostList(filters: JobPostListQuery, signal: AbortSignal): Promise<Job[]> {
    try {
      const response = await httpRequest.get<Job[]>("/job-post", {
        params: filters,
        signal,
      });
      if (!Array.isArray(response.data)) throw new Error("Dữ liệu việc làm không hợp lệ");
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw new AppError(error.message, error.code, error.status);
      }
      throw new AppError("Đã có lỗi xảy ra", "INTERNAL SERVER", 500);
    }
  }
}

export default new JobPostService();
