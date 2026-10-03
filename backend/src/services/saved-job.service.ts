import { AppError } from "../exceptions";
import { prisma } from "../utils/prisma";
export class SavedJobService {
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
      throw new AppError("Chỉ ứng viên được lưu việc làm", "FORBIDDEN", 403);
    return candidate.id;
  }
  async list(accountId: string) {
    const candidateId = await this.candidate(accountId);
    return (
      await this.db.savedJob.findMany({
        where: { candidateId },
        select: { jobPostId: true },
      })
    ).map((row) => row.jobPostId);
  }
  async save(accountId: string, jobPostId: string) {
    const candidateId = await this.candidate(accountId);
    const job = await this.db.jobPost.findFirst({
      where: {
        id: jobPostId,
        status: "PUBLISHED",
        deletedAt: null,
        company: {
          deletedAt: null,
          account: { status: "active", deletedAt: null },
        },
      },
      select: { id: true },
    });
    if (!job)
      throw new AppError("Tin tuyển dụng không còn khả dụng", "NOT_FOUND", 404);
    await this.db.savedJob.upsert({
      where: { candidateId_jobPostId: { candidateId, jobPostId } },
      create: { candidateId, jobPostId },
      update: {},
    });
    return { jobPostId, saved: true };
  }
  async remove(accountId: string, jobPostId: string) {
    const candidateId = await this.candidate(accountId);
    await this.db.savedJob.deleteMany({ where: { candidateId, jobPostId } });
    return { jobPostId, saved: false };
  }
}
export default new SavedJobService();
