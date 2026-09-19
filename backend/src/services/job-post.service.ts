import { prisma } from "../utils/prisma";

class JobPostService {
  async getManyJobPost(query: string) {
    const quantityJobs = await prisma.jobPost.count();
    const companyData =  await prisma.jobPost.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: {
        createdAt: "desc"
      },
    })
    return {
      ...companyData,
      quantityJobs
    }
  }

};
const jobPostService = new JobPostService();
export default jobPostService;