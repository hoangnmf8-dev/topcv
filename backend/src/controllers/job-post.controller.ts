import { Request, Response, NextFunction } from "express";
import jobPostService from "../services/job-post.service";

class JobPostController {
  async getJobPost(req: Request, res: Response, next: NextFunction) {
    try {
      return res.json(await jobPostService.getJobPost(String(req.params.id)));
    } catch (error) { next(error); }
  }

  async getManyJobPost(req: Request, res: Response, next: NextFunction) {
    try {
      const params = req.query;
      const companyData = await jobPostService.getManyJobPost(params);
      return res.json(companyData)
    } catch(error) {
      next(error);
    }
  }
}
const jobPostController = new JobPostController();
export default jobPostController;