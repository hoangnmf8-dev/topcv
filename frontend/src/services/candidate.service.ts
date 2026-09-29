import { AppError } from "@/exceptions";
import { httpRequest } from "@/lib/utils";
import { CandidateUpdate } from "@/types";

class CandidateService {
  async updateCandidate(id: string, data: CandidateUpdate) {
    try {
      const response = await httpRequest.patch(`/candidate/${id}`, {
        data,
      });
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
const candidateService = new CandidateService();
export default candidateService;
