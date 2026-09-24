import { httpRequest } from "@/lib/utils";

import type { Job } from "@/types";

class JobPostService {
  async getJobPost(id: string, signal?: AbortSignal): Promise<Job> {
    const response = await httpRequest.get<Job>(
      `/job-post/${encodeURIComponent(id)}`,
      { signal },
    );
    return response.data;
  }

  async getJobPostList(
    sort: string,
    page: number,
    limit = 8,
    signal?: AbortSignal,
  ): Promise<Job[]> {
    const response = await httpRequest.get<Job[]>("/job-post", {
      params: { sort, page, limit },
      signal,
    });
    if (!Array.isArray(response.data)) {
      throw new Error("Dữ liệu danh sách việc làm không hợp lệ");
    }
    return response.data;
  }
}

export default new JobPostService();
