import {Request, Response, NextFunction} from "express";
import aiService from "../services/AI.service";
import { successResponse } from "../utils/response";

class AIController {
  async generateTextAI(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const task = body.task;
      const context = body.context;
      const response = await aiService.generateTextAI(task, context);
      return successResponse(res, response, "Phản hồi thành công");
    } catch(error) {
      next(error);
    }
  }
}
const aiController = new AIController();
export default aiController;