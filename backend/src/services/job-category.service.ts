import { prisma } from "../utils/prisma";

class JobCategoryService {
  async getJobCategory() {
    return await prisma.jobCategory.findMany();
  }
  async getTopJob() {
    return prisma.jobCategory.findMany({
      select: {
        name: true,
        code: true,
        _count: {
          select: {
            jobPosts: {
              where: {
                status: "PUBLISHED",
              },
            },
          },
        },
      },
      orderBy: {
        jobPosts: {
          _count: "desc"
        }
      },
      take: 8
    });
  }
}
const jobCategoryService = new JobCategoryService();
export default jobCategoryService;
