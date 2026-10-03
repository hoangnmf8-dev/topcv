import type { Request, Response, NextFunction } from "express";
import { successResponse } from "../utils/response";
import candidateService from "../services/candidate.service";
import { candidateUpdateSchema } from "../validators/candidate.validate";
import { AppError } from "../exceptions";
import completionService from "../services/profile-completion.service";

class CandidateController {
  async updateCandidate(req: Request, res: Response, next: NextFunction) {
    const { data } = req.body;
    const id = req.params.id as unknown as string;
    try {
      const parsed = candidateUpdateSchema.safeParse(data);
      if (!parsed.success)
        throw new AppError("Thông tin hồ sơ không hợp lệ", "BAD_REQUEST", 400);
      const newCandidate = await candidateService.updateCandidate(
        id,
        parsed.data,
        req.profile.id,
      );
      const completion = await completionService.get(req.profile.id);
      return successResponse(
        res,
        { ...newCandidate, profileCompletion: completion.percentage },
        "Cập nhật thông tin thành công",
      );
    } catch (error) {
      next(error);
    }
  }
}
const candidateController = new CandidateController();
export default candidateController;
