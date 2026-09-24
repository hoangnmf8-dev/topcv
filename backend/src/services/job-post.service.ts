import { AppError } from "../exceptions";
import uploadService from "./upload.service";
import { JobPostListQuery } from "../types/job-post.type";
import { prisma } from "../utils/prisma";

class JobPostService {
  async getJobPost(id: string) {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      throw new AppError("Không tìm thấy việc làm", "JOB_NOT_FOUND", 404);
    }
    const job = await prisma.jobPost.findFirst({
      where: {
        id,
        deletedAt: null,
        status: "PUBLISHED",
        company: { deletedAt: null },
      },
      include: {
        company: {
          select: {
            name: true,
            logoKey: true,
            sizeRange: true,
            website: true,
            address: true,
            description: true,
          },
        },
        location: { select: { name: true } },
        category: { select: { name: true } },
      },
    });
    if (!job)
      throw new AppError(
        "Tin tuyển dụng không tồn tại hoặc không còn được công khai",
        "JOB_NOT_FOUND",
        404,
      );
    return {
      ...job,
      company: {
        ...job.company,
        logoUrl: job.company.logoKey
          ? await uploadService.createImageUrl(job.company.logoKey)
          : null,
      },
    };
  }

  async getManyJobPost(params: JobPostListQuery) {
    const options = this.buildJobPostWhere(params);
    const jobs = await prisma.jobPost.findMany({
      include: {
        company: {
          select: {
            name: true,
            logoKey: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
      },
      where: options.where,
      orderBy: options.orderBy,
      take: +params.limit!,
      skip: (+params.page! - 1) * +params.limit!,
    });
    const urls = new Map<string, string>();
    await Promise.all(
      [
        ...new Set(
          jobs
            .map((job) => job.company.logoKey)
            .filter((key): key is string => !!key),
        ),
      ].map(async (key) => {
        urls.set(key, await uploadService.createImageUrl(key));
      }),
    );
    return jobs.map((job) => ({
      ...job,
      company: {
        ...job.company,
        logoUrl: job.company.logoKey ? urls.get(job.company.logoKey) : null,
      },
    }));
  }
  buildJobPostOrderBy(jobPostListQuery: JobPostListQuery) {
    if (jobPostListQuery.sort) {
      switch (jobPostListQuery.sort) {
        case "newest":
          return {
            orderBy: {
              createdAt: "desc",
            },
          };
        case "salary":
          return {
            orderBy: {
              salaryMax: "desc",
            },
          };
        case "hot":
          return {
            isBoosted: true,
          };
      }
    }
  }
  buildJobPostWhere(jobPostListQuery: JobPostListQuery) {
    let where = {},
      orderBy = {};
    const sortCondition = this.buildJobPostOrderBy(jobPostListQuery);
    if (sortCondition?.isBoosted) {
      where = {
        ...sortCondition,
      };
    }
    if (sortCondition?.orderBy) {
      orderBy = {
        ...sortCondition.orderBy,
      };
    }
    return {
      where,
      orderBy,
    };
  }
}
const jobPostService = new JobPostService();
export default jobPostService;
