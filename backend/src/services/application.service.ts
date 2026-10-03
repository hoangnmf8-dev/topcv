import { prisma } from "../utils/prisma";
import { notify } from "./notification.service";
import { AppError } from "../exceptions";
import { cvDataSchema } from "../validators/cv.validate";
import type { z } from "zod";
import type { applicationCreateSchema } from "../validators/application.validate";
export class ApplicationService {
  constructor(private db = prisma) {}
  private async candidate(accountId: string) {
    const candidate = await this.db.candidate.findFirst({
      where: {
        accountId,
        deletedAt: null,
        account: { role: "candidate", status: "active", deletedAt: null },
      },
      select: { id: true },
    });
    if (!candidate)
      throw new AppError("Chỉ ứng viên được nộp hồ sơ", "FORBIDDEN", 403);
    return candidate.id;
  }
  async status(accountId: string, jobPostId: string) {
    const candidateId = await this.candidate(accountId);
    return this.db.application.findFirst({
      where: { candidateId, jobPostId, deletedAt: null },
      select: { id: true, status: true, appliedAt: true, cvId: true },
    });
  }
  async create(
    accountId: string,
    input: z.infer<typeof applicationCreateSchema>,
  ) {
    const candidateId = await this.candidate(accountId);
    return this.db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM candidate WHERE id = ${candidateId}::uuid FOR UPDATE`;
      const existing = await tx.application.findUnique({
        where: {
          jobPostId_candidateId: { jobPostId: input.jobPostId, candidateId },
        },
      });
      if (existing)
        throw new AppError(
          "Bạn đã ứng tuyển công việc này",
          "ALREADY_APPLIED",
          409,
        );
      await tx.$queryRaw`SELECT id FROM job_post WHERE id = ${input.jobPostId}::uuid FOR SHARE`;
      const job = await tx.jobPost.findFirst({
        where: {
          id: input.jobPostId,
          deletedAt: null,
          status: "PUBLISHED",
          OR: [{ deadlineAt: null }, { deadlineAt: { gte: new Date() } }],
          company: {
            deletedAt: null,
            account: { status: "active", deletedAt: null },
          },
        },
        select: {
          id: true,
          title: true,
          company: { select: { accountId: true } },
        },
      });
      if (!job)
        throw new AppError(
          "Tin tuyển dụng đã hết hạn hoặc không còn nhận hồ sơ",
          "JOB_UNAVAILABLE",
          400,
        );
      const cv = await tx.cv.findFirst({
        where: { id: input.cvId, candidateId, deletedAt: null },
        select: { fileKey: true, contentJson: true },
      });
      if (
        !cv ||
        (!cv.fileKey && !cvDataSchema.safeParse(cv.contentJson).success)
      )
        throw new AppError("CV không hợp lệ hoặc đã bị xóa", "INVALID_CV", 400);
      const application = await tx.application.create({
        data: {
          candidateId,
          jobPostId: input.jobPostId,
          cvId: input.cvId,
          coverLetter: input.coverLetter || null,
          status: "submitted",
        },
        select: {
          id: true,
          jobPostId: true,
          cvId: true,
          status: true,
          appliedAt: true,
        },
      });
      await notify(tx, {
        recipientAccountId: accountId,
        type: "application",
        title: "Ứng tuyển thành công",
        description: `Bạn đã gửi hồ sơ cho vị trí ${job.title}.`,
        link: "/candidate?tab=applications",
        eventKey: `application:${application.id}:submitted:candidate`,
      });
      await notify(tx, {
        recipientAccountId: job.company.accountId,
        type: "application",
        title: "Có hồ sơ ứng tuyển mới",
        description: `Vị trí ${job.title} vừa nhận được một hồ sơ.`,
        link: "/employer?tab=candidates",
        eventKey: `application:${application.id}:submitted:company`,
      });
      return application;
    });
  }
}
export default new ApplicationService();
