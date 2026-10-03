import {Request, Response, NextFunction} from "express";
import aiService from "../services/AI.service";
import { successResponse } from "../utils/response";
import { reserveAi, finishAi } from "../services/subscription.service";

class AIController {
  async generateTextAI(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const task = body.task;
      const context = body.context;
      const usageId = await reserveAi(req.profile.id);
      let response;
      try { response = await aiService.generateTextAI(task, context); }
      catch (error) { if (usageId) await finishAi(usageId, false); throw error; }
      if (usageId) await finishAi(usageId, true);
      return successResponse(res, response, "Phản hồi thành công");
    } catch(error) {
      next(error);
    }
  }
}
const aiController = new AIController();
export default aiController;
