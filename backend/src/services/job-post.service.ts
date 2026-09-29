import { AppError } from "../exceptions";
import uploadService from "./upload.service";
import { JobPostListQuery } from "../types/job-post.type";
import { prisma } from "../utils/prisma";
import { Prisma } from "../generated/prisma/client";

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
        province: { select: { name: true } },
        ward: { select: { id: true, fullName: true } },
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
  };
  async getManyJobPost(params: JobPostListQuery) {
    const page = Number(params.page ?? 1);
    const limit = Number(params.limit ?? 8);
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      throw new AppError(
        "Trang hoặc số lượng kết quả không hợp lệ",
        "INVALID_PAGINATION",
        400,
      );
    }
    const where = await this.buildJobPostWhere(params);
    const orderBy = this.buildJobPostOrderBy(params);
    const jobs = await prisma.jobPost.findMany({
      include: {
        company: {
          select: { name: true, logoKey: true },
        },
        province: {
          select: { name: true },
        },
        ward: {
          select: { id: true, fullName: true },
        },
      },
      where,
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
    });
    //Hàm lấy url
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
  buildJobPostOrderBy(
    params: JobPostListQuery,
  ): Prisma.JobPostOrderByWithRelationInput[] {
    if (params.sort === "salary") {
      return [{ salaryMax: { sort: "desc", nulls: "last" } }, { id: "desc" }];
    }
    return [{ createdAt: "desc" }, { id: "desc" }];
  }
  async buildJobPostWhere(
    params: JobPostListQuery,
  ): Promise<Prisma.JobPostWhereInput> {
    const conditions: Prisma.JobPostWhereInput[] = [];
    if (params.query) {
      conditions.push({
        OR: [
          {
            title: {
              contains: params.query,
              mode: "insensitive",
            },
          },
          {
            company: {
              name: {
                contains: params.query,
                mode: "insensitive",
              },
            },
          },
        ],
      });
    }
    if (params.jobTitleIds?.length) {
      conditions.push({
        jobTitleId: { in: params.jobTitleIds },
      });
    }
    if (params.employmentType) {
      conditions.push({
        employmentType: params.employmentType,
      });
    }
    const experience = params.experienceYearsMin;
    if (experience != null) {
      conditions.push({
        experienceYearsMin: experience >= 5 ? { gte: experience } : experience,
      });
    }
    if (params.saturdaySchedule) {
      conditions.push({
        saturdaySchedule: params.saturdaySchedule,
      });
    }
    if (params.salary?.min != null) {
      conditions.push({
        salaryMax: { gte: params.salary.min },
      });
    }
    if (params.salary?.max != null) {
      conditions.push({
        salaryMin: { lte: params.salary.max },
      });
    };
    // if(!params.salary?.min && params.salary?.max === 10000000) {
    //   conditions.push({
    //     salaryMax: {lt: 10000000}
    //   })
    // };
    if (params.wardIds?.length) {
      const wards = await prisma.ward.findMany({
        where: { id: { in: params.wardIds } },
        select: { id: true, provinceId: true },
      });
      if (wards.length !== new Set(params.wardIds).size) {
        throw new AppError(
          "Có phường/xã không tồn tại",
          "INVALID_LOCATION",
          400,
        );
      }
      if (
        params.provinceIds?.length &&
        wards.some((ward) => !params.provinceIds.includes(ward.provinceId))
      ) {
        throw new AppError(
          "Phường/xã không thuộc tỉnh/thành đã chọn",
          "INVALID_LOCATION",
          400,
        );
      }
      const partialProvinceIds = new Set(wards.map((ward) => ward.provinceId));
      const wholeProvinceIds = params.provinceIds.filter(
        (id) => !partialProvinceIds.has(id),
      );
      const locationConditions: Prisma.JobPostWhereInput[] = [
        { wardId: { in: params.wardIds } },
      ];
      if (wholeProvinceIds.length) {
        locationConditions.push({
          provinceId: { in: wholeProvinceIds },
        });
      }
      conditions.push({ OR: locationConditions });
    } else if (params.provinceIds.length) {
      conditions.push({
        provinceId: { in: params.provinceIds },
      });
    }
    return {
      deletedAt: null,
      status: "PUBLISHED",
      company: { deletedAt: null },
      ...(params.sort === "hot" ? { isBoosted: true } : {}),
      AND: conditions,
    };
  }
}
const jobPostService = new JobPostService();
export default jobPostService;
