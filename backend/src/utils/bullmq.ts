import "dotenv/config";
import IORedis from "ioredis";
let redisQueueConnection = null;
let redisWorkerConnection = null;
if (!redisQueueConnection) {
  redisQueueConnection = new IORedis(
    process.env.REDIS_URL ?? "redis://localhost:6379",
  );
}
if (!redisWorkerConnection) {
  redisWorkerConnection = new IORedis(
    process.env.REDIS_URL ?? "redis://localhost:6379",
    {
      maxRetriesPerRequest: null,
    },
  );
}
export { redisQueueConnection, redisWorkerConnection };
