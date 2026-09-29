import { GoogleGenAI } from "@google/genai";
import { AiTask, COMMON_RULES, TASK_RULES } from "../rules";
class AIService {
  async generateTextAI(task: AiTask, context: Record<string, unknown>) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Thiếu GEMINI_API_KEY");
    }
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-3.8-flash",
      config: {
        systemInstruction: `
          ${COMMON_RULES}
          Hướng dẫn tác vụ:
          ${TASK_RULES[task]}
        `,
      },
      contents: JSON.stringify(context),
    });
    const text = response.text?.trim();
    if (!text) {
      throw new Error("AI chưa trả về nội dung phù hợp");
    }
    return text;
  }
}
const aiService = new AIService();
export default aiService;
