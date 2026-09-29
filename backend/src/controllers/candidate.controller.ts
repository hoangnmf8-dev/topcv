import type { Request, Response, NextFunction } from "express";
import { successResponse } from "../utils/response";
import candidateService from "../services/candidate.service";

class CandidateController {
  async updateCandidate(req: Request, res: Response, next: NextFunction) {
    const {data} = req.body;
    console.log("🚀 ~ CandidateController ~ updateCandidate ~ data:", data)
    const id = req.params.id as unknown as string;
    try {
      const newCandidate = await candidateService.updateCandidate(id, data);
      return successResponse(res, newCandidate, "Cập nhật thông tin thành công");
    } catch(error) {
      next(error);
    }
  }
};
const candidateController = new CandidateController();
export default candidateController;