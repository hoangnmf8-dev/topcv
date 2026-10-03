import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "../utils/prisma";
import { reconcilePayment } from "../services/billing.service";
import { paymentsConfigured } from "../services/payos.service";
import { subscriptionNotifications } from "../services/notification-maintenance.service";
import { enforceAllCompanyJobQuotas } from "../services/company-job-quota.service";
import {
  expireJobPosts,
  JOB_EXPIRATION_SCHEDULE,
} from "../services/job-expiration.service";

const queue = new Queue("billing-maintenance", {
  connection: new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379"),
});
export async function billingMaintenance() {
  const now = new Date();
  await subscriptionNotifications(now);
  await enforceAllCompanyJobQuotas();
  await prisma.subscription.updateMany({
    where: { status: { in: ["active", "scheduled"] }, expiresAt: { lte: now } },
    data: { status: "expired" },
  });
  await prisma.subscription.updateMany({
    where: {
      status: "scheduled",
      startedAt: { lte: now },
      expiresAt: { gt: now },
    },
    data: { status: "active" },
  });
  if (paymentsConfigured()) {
    const pending = await prisma.payment.findMany({
      where: { provider: "payos", status: { in: ["pending", "processing"] } },
      orderBy: { updatedAt: "asc" },
      take: 50,
    });
    for (const payment of pending) {
      try {
        await reconcilePayment(payment.id);
      } catch {
        console.error("Payment reconciliation needs retry", payment.id);
      }
    }
  }
  await prisma.order.updateMany({
    where: {
      status: "pending",
      paymentDeadlineAt: { lte: now },
      payments: { none: {} },
    },
    data: { status: "expired" },
  });
}
const worker = new Worker(
  "billing-maintenance",
  async (job) => {
    if (job.name === "expire-job-posts") {
      const result = await expireJobPosts();
      return result;
    }
    if (job.name === "reconcile") return billingMaintenance();
    throw new Error(`Unknown maintenance job: ${job.name}`);
  },
  {
    connection: new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: null,
    }),
    concurrency: 1,
  },
);
worker.on("failed", (job, error) =>
  console.error("Maintenance job failed", job?.name, error.message),
);
worker.on("error", (error) =>
  console.error("Maintenance worker error", error.message),
);
void queue.upsertJobScheduler(
  "billing-every-minute",
  { every: 60000 },
  {
    name: "reconcile",
    data: {},
    opts: { removeOnComplete: 10, removeOnFail: 20 },
  },
);
void queue
  .upsertJobScheduler("job-expiration-daily", JOB_EXPIRATION_SCHEDULE, {
    name: "expire-job-posts",
    data: {},
    opts: {
      attempts: 4,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 30,
      removeOnFail: 30,
    },
  })
  .catch((error) =>
    console.error("Job expiration scheduler registration failed", error),
  );
