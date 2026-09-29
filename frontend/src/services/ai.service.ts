import { AppError } from "@/exceptions";
import { httpRequest } from "@/lib/utils";

class AIService {
  async generateTextAI(task: string, context: Record<string, unknown>) {
    try {
      const response = await httpRequest.post("/ai/generate", {
        task, 
        context
      });
      return response.data;
    } catch(error) {
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
};
const aiService = new AIService();
export default aiService;