import { GoogleGenAI } from "@google/genai";
import {
  AiTask,
  COMMON_RULES,
  TASK_RULES,
  AI_TEXT_LIMITS,
  formatAiText,
} from "../rules";
import { AppError } from "../exceptions";
export class AIService {
  constructor(
    private createClient = (apiKey: string) => new GoogleGenAI({ apiKey }),
  ) {}
  async generateTextAI(task: AiTask, context: Record<string, unknown>) {
    if (
      !Object.hasOwn(TASK_RULES, task) ||
      !context ||
      typeof context !== "object" ||
      Array.isArray(context) ||
      typeof context.currentText !== "string" ||
      !context.currentText.trim()
    ) {
      throw new AppError(
        "Vui lòng nhập nội dung cần cải thiện",
        "INVALID_AI_INPUT",
        400,
      );
    }
    const limit = AI_TEXT_LIMITS[task];
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Thiếu GEMINI_API_KEY");
    }
    const ai = this.createClient(apiKey);
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL ?? "gemini-3.8-flash",
        config: {
          systemInstruction: `
            ${COMMON_RULES}
            Hướng dẫn tác vụ:
            ${TASK_RULES[task]}
            Giới hạn bắt buộc: ${limit} ký tự cho toàn bộ kết quả. ${attempt ? "Kết quả trước vượt giới hạn; viết lại súc tích, giữ trọn ý và không cắt ngang câu." : ""}
          `,
        },
        contents: JSON.stringify(context),
      });
      const text = response.text?.trim();
      if (!text) {
        throw new Error("AI chưa trả về nội dung phù hợp");
      }
      const formatted = formatAiText(text);
      if (!formatted)
        throw new AppError(
          "AI chưa trả về nội dung phù hợp",
          "INVALID_AI_OUTPUT",
          422,
        );
      if (!formatted)
        throw new AppError(
          "AI chưa trả về nội dung phù hợp",
          "INVALID_AI_OUTPUT",
          422,
        );
      if (formatted.length <= limit) return formatted;
    }
    throw new AppError(
      "Nội dung AI vượt giới hạn ký tự. Vui lòng thử lại hoặc rút gọn nội dung đầu vào.",
      "AI_TEXT_TOO_LONG",
      422,
    );
  }
}
const aiService = new AIService();
export default aiService;
