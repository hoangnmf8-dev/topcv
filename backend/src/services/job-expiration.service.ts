import { prisma } from "../utils/prisma";
import type { Prisma } from "../generated/prisma/client";

export const JOB_EXPIRATION_SCHEDULE = {
  pattern: "0 2 * * *",
  tz: "Asia/Ho_Chi_Minh",
};

export async function expireJobPosts(
  now = new Date(),
  db: Prisma.TransactionClient = prisma,
) {
  await db.jobPost.updateMany({where:{isBoosted:true,boostedUntil:{lte:now}},data:{isBoosted:false}});
  return db.jobPost.updateMany({
    where: {
      deletedAt: null,
      status: { in: ["PUBLISHED", "PENDING", "PAUSED"] },
      deadlineAt: { lte: now },
    },
    data: { status: "EXPIRED", isBoosted: false },
  });
}
