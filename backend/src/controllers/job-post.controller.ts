import { Request, Response, NextFunction } from "express";
import jobPostService from "../services/job-post.service";

class JobPostController {
  async getManyJobPost(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q;
      const companyData = await jobPostService.getManyJobPost(query);
      return res.json(companyData)
    } catch(error) {
      next(error);
    }
  }
}
const jobPostController = new JobPostController();
export default jobPostController;