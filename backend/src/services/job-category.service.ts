import { prisma } from "../utils/prisma";

class JobCategoryService {
  async getJobCategory() {
    return await prisma.jobCategory.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      include: {
        jobTitles: {
          where: { deletedAt: null },
          select: { id: true, code: true, name: true, jobCategoryId: true },
          orderBy: { name: "asc" },
        },
      },
    });
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
          _count: "desc",
        },
      },
      take: 8,
    });
  }
}
const jobCategoryService = new JobCategoryService();
export default jobCategoryService;
